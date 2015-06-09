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
      # info_regex = /Materia: (?<subject_code>[A-Z]{3}[0-9]{4}).+Grupo: (?<group>[0-9]{1,3}).+NRC: (?<un_id>[0-9]{4,5}).+Matriculados: (?<used>[0-9]+)Cupos Disponibles: (?<available>[0-9]+)/
      info_regex = /(?<name>.*)Materia:.*(?<code>[A-Z]{3}[0-9]{4}).*Grupo: (?<group>[0-9]{1,3}).*NRC: (?<id>[0-9]{4,5}).*Matriculados: (?<used>[0-9]+).*Cupos Disponibles: (?<available>[0-9]+)/
      code_list.each do |code|
        response = $robot.post(courses_url, valida: 'OK', mat: code, BtnCodigo: 'Buscar', datos_periodo: current_period, nom_periodo: current_period_name).parser
        response.css("div.div").each do |course_html|
          clean_course_info = course_html.css('p').text.gsub(/(\r|\n|\t)/, '')
          course_info = info_regex.match(clean_course_info)
          course = Hash[course_info.names.zip(course_info.captures)]
          course['professors'] = []
          course['code'] = "#{course['code']}-#{course['group']}" 
          course.delete('group')
          # schedule_rows = course_html.css('table tr')[1..-1]
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

    def self.current_period_name
      name = 'Horarios '
      name = Time.now.month <= 5 ? 'Primer Semestre ' : 'Segundo Semestre '
      name + current_period 
    end
  end

  module Subject
    
    # Methods
    def self.all
      subjects, codes = [], []
      Course.all.each do |course|
        unless codes.include? course['code']
          codes.push course['code']
          subjects.push({ code: course['code'].split('-')[0], name: course['name'] })
        end
      end
      subjects
    end
  end
end