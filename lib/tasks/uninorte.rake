# Encoding: utf-8

require 'erb'
require 'set'
require_relative '../code_getter'
require_relative '../subjects_getter'

namespace :uninorte do
  desc "creates the codes.yml file"
  task :create_codes do
    pool = CodeGetter.pool size: 4
    codes = Set.new((0..9999).to_a.map{|nrc| pool.future.get_code(nrc) }.map(&:value).reject(&:nil?))
    file_content = codes.to_a.sort.map{|code| " - #{code}"}.join("\n")
    File.open('config/codes.yml', 'w') { |file| file.write(file_content) }
  end

  desc "creates the autocomplete_data.js" 
  task :create_autocomplete_data do
    pool = SubjectsGetter.pool size: 4
    subject_data = SubjectsGetter.code_list.map{|code| pool.future.get_subjects(code) }
                                  .map(&:value).reduce(&:merge)

    erb = ERB.new %Q{
    var autocomplete_data = [
      <%- subject_data.each do |code, name| -%>
        { value: '<%= format_name(name, code) %>', data: '<%= code %>' },
      <%- end -%>
    ];}, nil, "-"

    output_file = File.join Rails.root, 'app', 'assets', 'javascripts', 'autocomplete_data.js'
    File.open(output_file, 'w') { |file| file.write(erb.result(binding)) }
  end
end

def format_name(name, code)
  name = name.strip.squeeze(" ").gsub("&","y")
           .gsub(/[^0-9a-zA-ZáéíóúÁÉÍÓÚÑñ'\s]/,"")
           .gsub("Ñ","ñ").gsub(/[Áá]/,"a").gsub(/[Éé]/,"e")
           .gsub(/[Íí]/,"i").gsub(/[Óó]/,"o").gsub(/[Úú]/,"u").upcase
  "#{name} (#{code})"
end

