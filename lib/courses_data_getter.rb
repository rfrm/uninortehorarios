require_relative 'getter'

class CoursesDataGetter < Getter
  def self.get_courses(subject_code)
    r = Typhoeus.post "http://guayacan.uninorte.edu.co/registro/resultado_codigo.asp", body: form_values(subject_code)

    doc = Nokogiri::HTML(r.body)
    doc.css("body > div").map do |div|
      raw_data = div.text.split("\r\n").map(&:strip).reject(&:empty?)
      name = raw_data[0]
      raw_data = Hash[raw_data.drop(1).take(5).map{|s| s.split(": ")}.map{|k, v| [k.parameterize.underscore, v]}]
      data = {name: name, available: raw_data["cupos_disponibles"].to_i, nrc: raw_data["nrc"], mat: raw_data["materia"]}

      schedule = {}
      lecture_teachers = Set.new
      lectures = div.css("table tr")[1..-1]
      lectures.each do |lecture|
        days, hour, teacher = lecture.text.split("\r\n").map(&:strip).slice(3,6)
        start_hour, end_hour = hour.strip.chomp.split(" - ")

        #Process teacher name
        lastnames, name = teacher.split(", ")
        if name.include? "Profesor"
          teacher = "#{name} #{lastnames}"
        else
          lastnames = lastnames.split(" ")
          if lastnames.length > 2
            teacher = "#{name} #{lastnames.join(" ")}"
          else
            lastname = lastnames[0]
            teacher = "#{name} #{lastname}"
          end
        end
        lecture_teachers.add(teacher.titleize)

        if not start_hour.nil? and not end_hour.nil?
          start_hour= start_hour[0,2].to_i
          end_hour= end_hour[0,2].to_i
          if not days.empty?
            days.each_char do |day|
              start_hour.upto(end_hour-1) do |hour|
                (schedule[day] ||= []) << hour
              end
            end
          end
        end
      end

      data["lecture_teachers"] = lecture_teachers.to_a.sort
      data["schedule"] = schedule
      data
    end
  end

  def self.form_values(subject_code)
    {'valida' => 'OK', 'mat' => subject_code, 'BtnCodigo' => 'Buscar',
     'datos_periodo' => current_period, 'nom_periodo' => current_period_name}
  end
end

