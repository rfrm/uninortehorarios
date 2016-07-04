class SubjectsController < ApplicationController
  def show
    subject_code = params[:id]
    @subject = Subject.find_by code: subject_code
    courses = @subject.parsed_data
    subject_teachers = courses.map{ |h| h["lecture_teachers"] }.flatten.uniq.sort

    expires_in @subject.expires_in + 2.minutes, public: true
    render json: {name: courses[0]["name"], mat: subject_code,
                  subject_teachers: subject_teachers, courses: courses }
  end
end

