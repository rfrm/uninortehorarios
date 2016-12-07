class SubjectsController < ApplicationController
  def show
    @subject = Subject.find_by(code: subject_code)

    if stale?(etag: @subject, last_modified: @subject.refreshed_at, public: true)
      subject_code = params[:id]
      courses = @subject.parsed_data
      subject_teachers = courses.map{ |h| h["lecture_teachers"] }.flatten.uniq.sort

      render json: {name: courses[0]["name"], mat: subject_code,
                    subject_teachers: subject_teachers, courses: courses }
    end
  end
end

