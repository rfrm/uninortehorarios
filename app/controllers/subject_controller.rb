require 'set'
require 'typhoeus'
require 'nokogiri'

class SubjectController < ApplicationController

	def autocomplete		
		@subject_data = Subject.all.collect{|s| {value: "#{s.escaped_name.upcase} (#{s.code})", data: "#{s.code}"}}	
		respond_to do |format|
  		format.json  { render :json => @subject_data }
  	end 	
	end

	def courses
		@subject_code = params[:subject_code]
		info_regex = /Materia: (?<mat>[A-Z]{3}[0-9]{4} - [0-9]{1,2}).+NRC: (?<nrc>[0-9]{4,5}).+Matriculados: (?<used>[0-9]+)Cupos Disponibles: (?<available>[0-9]+)/
		pattern = /([a-zA-Z]{3})(\d{4})/
		pattern =~ @subject_code
		response = Typhoeus::post("http://guayacan.uninorte.edu.co/registro/resultado_curso.asp", body: {valida: "OK", mat2: $1, curso: $2, BtnCurso: "Buscar", datos_periodo: current_period, nom_periodo: current_period_name})
		doc = Nokogiri::HTML(response.body)
		tables = doc.css("table[cellpadding='0'][align='center']")

		courses = []
		subject_teachers = Set.new
		tables.each do |table|
			#Get basic course info
		    name = table.css("tr td b").text
		    info_text = table.css("tr td p").text.gsub(/(\r|\n|\t)/,"")
		    info = info_regex.match(info_text)
		    info_hash = Hash[ info.names.zip( info.captures ) ]
		    info_hash["mat"] = info_hash["mat"].split(" - ")[0]
		    course = {"name" => name}.merge(info_hash)

		    # Get schedule from table
		    schedule = {}
		    lecture_teachers = Set.new
			lectures = table.css("tr td table tr")[1..-1]
			lectures.each do |lecture|
				start_date, end_date, days, hour, teacher, place = lecture.text.split("\r\n").map(&:strip).reject(&:empty?)
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
				lecture_teachers.add(teacher)

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
			course["lecture_teachers"] = lecture_teachers.to_a.sort.join(" y ")
			subject_teachers.add(course["lecture_teachers"])
			course["schedule"] = schedule
			courses.push(course)
		end

		begin
			respond_to do |format|
	    		format.json  { render :json => {name: courses[0]["name"],
	    										mat: courses[0]["mat"],
	    										subject_teachers: subject_teachers.to_a,
	    										courses: courses }}
	  		end
	  	rescue Exception => e
	  		respond_to do |format|
	    		format.json  { render :json => {error_message: e.message} }
	  		end
	  	end
	end

	private
	def current_period
    Time.now.year.to_s.concat(Time.now.month <= 5 ? '10' : '30')
  end

  def current_period_name
    name = Time.now.month <= 5 ? 'Primer Semestre ' : 'Segundo Semestre '
    name + current_period 
  end
end
