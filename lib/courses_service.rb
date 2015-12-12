class SubjectService
  def initialize(subject_code)
    /(?<mat>\w{3})(?<curso>\d{4})/ =~ subject_code
    @subject_code = subject_code
    @mat = mat
    @curso = curso
  end

  def get
    subject = Subject.find code: @subject_code
    if subject.stale?
      SubjectUpdaterService.update @subject_code
      subject.reload
    end
    subject
  end
end

