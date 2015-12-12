require 'set'
require 'typhoeus'
require 'nokogiri'

class SubjectsController < ApplicationController
	def show
      subject_code = params[:id]
      /(?<mat2>\w{3})(?<curso>\d{4})/ =~ subject_code
      response = Typhoeus::post("http://guayacan.uninorte.edu.co/registro/resultado_curso.asp",
                  body: {valida: "OK", mat2: mat2, curso: curso, BtnCurso: "Buscar", datos_periodo: "201610",
                         nom_periodo: "Horarios Primer Semestre 2016"})
      doc = Nokogiri::HTML response.body

      courses = doc.css("body > div").map do |div|
        raw_data = div.text.split("\r\n").map(&:strip).reject(&:empty?)
        name = raw_data[0]
        raw_data = Hash[raw_data.drop(1).take(5).map{|s| s.split(": ")}.map{|k, v| [k.parameterize.underscore, v]}]
        data = {name: name, available: raw_data["cupos_disponibles"].to_i, nrc: raw_data["nrc"], mat: subject_code}

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

      subject_teachers = courses.map{|h| h["lecture_teachers"]}.flatten.uniq.sort

      begin
        expires_in 3.minute, :public => true
        render json: {name: courses[0][:name], mat: subject_code,
                      subject_teachers: subject_teachers, courses: courses }
      rescue Exception => e
        render json: {error_message: e.message}
      end
	end

	private
      def current_period
        current_year, current_month = Time.now.year, Time.now.month
        period_code = if current_month < 6
          '10'
        elsif current_month >= 6 && current_month < 12
          '30'
        elsif current_month == 12
          current_year += 1
          '10'
        end
        "#{current_year}#{period_code}"
      end

      def current_period_name
        name = 'Horarios '
        name = Time.now.month <= 5 ? 'Primer Semestre ' : 'Segundo Semestre '
        name + current_period
      end
end
