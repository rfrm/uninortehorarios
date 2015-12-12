class SubjectService
  def self.get(subject_code)
    /(?<mat>\w{3})(?<curso>\d{4})/ =~ subject_code

    subject = Subject.where(code: subject_code).first_or_create
    if subject.needs_update?
      SubjectUpdaterService.update mat
      subject.reload
    end
    subject
  end
end

