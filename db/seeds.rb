require 'set'
require 'yaml'
require 'typhoeus'
require 'nokogiri'

Subject.delete_all
codes = YAML.load(File.read(File.expand_path('db/codes.yml')))

info_regex = /Materia: (?<mat>[A-Z]{3}[0-9]{4} - [0-9]{1,2})/
hydra = Typhoeus::Hydra.new(max_concurrency: 10)

subjects = Set.new
codes.each_with_index do |code, index| 
	request = Typhoeus::Request.new("http://guayacan.uninorte.edu.co/registro/resultado_codigo.asp", method: :post, body: {mat: code, BtnCurso: "Buscar", datos_periodo: "201410", nom_periodo: "Primer Semestre 2014"})
	request.on_complete do |response|
		puts "Worker#{index} done!"
		doc = Nokogiri::HTML(response.body)
		tables = doc.css("table[cellpadding='0'][align='center']")
		tables.each do |table|
		    name = table.css("tr td b").text
		    info_text = table.css("tr td p").text.gsub(/(\r|\n|\t)/,"")
		    info = info_regex.match(info_text)
		    info_hash = Hash[ info.names.zip( info.captures ) ]
		    code = info_hash["mat"][0,7]
		    subjects.add({"name" => name, "code" => code})
	 	end
	end
	hydra.queue request
end	
hydra.run

subjects.each do |subject|
	Subject.create(subject)
end
