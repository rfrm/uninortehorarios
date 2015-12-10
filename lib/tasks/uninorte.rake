require 'set'
require_relative '../code_getter'
require_relative '../subjects_getter'

namespace :uninorte do
  desc "creates the codes.yml file"
  task :create_codes do
    pool = CodeGetter.pool size: 4
    codes = Set.new (0..9999).to_a.map{|nrc| pool.future.get_code(nrc) }.map(&:value).reject(&:nil?)
    file_content = codes.to_a.sort.map{|code| " - #{code}"}.join("\n")
    File.open('config/codes.yml', 'w') { |file| file.write(file_content) }
  end

  desc "Loads the subjects in the database"
  task load_subjects: :environment do
    Subject.delete_all
    pool = SubjectsGetter.pool size: 4
    SubjectsGetter.code_list.map{|code| pool.future.get_subjects(code) }
                  .map(&:value).reduce(&:merge).each do |code, name|
      Subject.create code: code, name: name
    end
  end
end


