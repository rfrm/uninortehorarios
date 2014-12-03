# Encoding: utf-8
# Library created by Alfonso Mancilla alvis
require 'mechanize'

module Unscrapper

  $robot = Mechanize.new { |a| a.ssl_version, a.verify_mode = 'TLSv1', OpenSSL::SSL::VERIFY_NONE }

  module Course
    # Constants
    CODES_FILE_NAME = 'uninorte_courses_codes.yml'

    # Methods
    def self.all
      courses = []
      courses_url = 'http://guayacan.uninorte.edu.co/registro/resultado_codigo.asp'
      info_regex = /Materia: (?<subject_code>[A-Z]{3}[0-9]{4} - [0-9]{1,2}).+NRC: (?<un_id>[0-9]{4,5}).+Matriculados: (?<used>[0-9]+)Cupos Disponibles: (?<available>[0-9]+)/
      code_list.each do |code|
        response = $robot.post(courses_url, valida: 'OK', mat: code, BtnCodigo: 'Buscar', datos_periodo: '201510', nom_periodo: 'Horarios Primer Semestre 2015').parser
        response.css("table[cellpadding='0'][cellspacing='0']").each do |course_html|
          clean_course_info = course_html.css('tr td p').text.gsub(/(\r|\n|\t)/, '')
          course_info = info_regex.match(clean_course_info)
          course = Hash[course_info.names.zip(course_info.captures)]
          course['subject_name'] = course_html.css('tr td b').text
          # course['professors'] = []
          # schedule_rows = course_html.css('tr td table tr')[1..-1]
          # schedule_rows.each do |schedule_row|
          #   start_date, end_date, days, hours, professor, place = schedule_row.text.split("\r\n").map(&:strip).reject(&:empty?)
          #   start_hour, end_hour = hours.strip.chomp.split(' - ')

          #   # Format professor name
          #   last_name, name = professor.split(', ')
          #   professor = "#{name} #{last_name}".downcase
          #   course['professors'].push(professor) unless course['professors'].include? professor

          #   # TODO: Fetch here course schedule info 
          # end

          courses.push course
        end
      end
      courses
    end

    private
    def self.code_list
      file_path = [Rails.root, 'config', CODES_FILE_NAME].join('/')
      raise LoadError, "Couldn't find the file '#{CODES_FILE_NAME}' in #{file_path}" unless File.exists?(file_path)
      YAML.load File.read(file_path)
    end

    def self.current_period
      Time.now.year.to_s.concat(Time.now.month <= 5 ? '10' : '30')
    end

    def self.current_period_name
      name = Time.now.month <= 5 ? 'Primer Semestre ' : 'Segundo Semestre '
      name + current_period 
    end
  end

  module Subject

    # Methods
    def self.all
      subjects = []
      subjects_names = []
      Course.all.each do |course|
        unless subjects_names.include? course['subject_name']
          subjects_names.push course['subject_name']
          subject = { name: course['subject_name'], code: course['subject_code'].split(' - ')[0] }
          subjects.push subject
        end
      end
      subjects
    end
  end
end