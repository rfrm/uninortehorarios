# Encoding: utf-8

require 'erb'
require 'set'
require 'yaml'

namespace :uninorte do
  desc 'creates the codes.yml file'
  task create_codes: :environment do
    pool = CodeGetter.pool size: 16
    codes =
      Set.new((1000..9999).to_a.map { |nrc| pool.future.get_code(nrc) }.map(&:value).reject(&:nil?))
    file_content = YAML.dump(codes.to_a.sort)
    File.open('config/codes.yml', 'w') { |file| file.write(file_content) }
  end

  desc 'creates the autocomplete_data.js'
  task create_autocomplete_data: :environment do
    pool = SubjectGetter.pool size: 8
    subject_data = SubjectGetter.code_list
                                .map { |code| pool.future.get_subjects(code) }
                                .map(&:value).reduce(&:merge)

    erb = ERB.new %{
    var autocomplete_data = [
      <%- subject_data.each do |code, name| -%>
        { label: '<%= format_name(name, code) %>', value: '<%= code %>' },
      <%- end -%>
    ];}, nil, '-'

    p erb.result(binding)

    output_file =
      File.join(Rails.root, 'app', 'assets', 'javascripts', 'autocomplete_data.js')
    File.open(output_file, 'w') { |file| file.write(erb.result(binding)) }
  end

  desc 'updates the PostgreSQL cache'
  task update_psql_cache: :environment do
    pool = CoursesDataGetter.pool size: 4
    courses =
      CoursesDataGetter.code_list.map { |subject_code| pool.future.get_courses(subject_code) }.map(&:value).flatten
    courses.group_by { |c| c[:mat] }.each do |code, parsed_data|
      s = Subject.where(code: code).first_or_create
      s.parsed_data = parsed_data
      s.save
    end
  end
end

def format_name(name, code)
  p "#{name} (#{code})"
  name = name.strip.squeeze(" ")
             .tr("Íí", "i").tr("Óó", "o").tr("Úú", "u")
             .tr("&", "y").tr("Áá", "a").tr("Éé", "e").upcase
  "#{name} (#{code})"
end
