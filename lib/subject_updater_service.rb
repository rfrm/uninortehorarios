require_relative 'courses_data_getter'

class SubjectUpdaterService
  def self.update(mat)
    CoursesDataGetter.get_courses(mat)
                     .group_by{|c| c[:mat]}.each do |code, parsed_data|
      s = Subject.where(code: code).first_or_create
      s.parsed_data = parsed_data
      s.save
    end
  end
end

