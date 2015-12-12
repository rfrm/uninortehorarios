FactoryGirl.define do
  factory :subject do
    sequence :code do |n|
      "XXX#{n.to_s.rjust(4, '0')}"
    end
    parsed_data []
  end

  factory :fresh_subject, parent: :subject do
    refreshed_at 1.minutes.ago
    parsed_data [{"mat"=>"ALE1031", "nrc"=>"5166", "name"=>"EXIGENCIA ALEMAN I",
                  "schedule"=>{"R"=>[6, 7], "T"=>[6, 7]}, "available"=>22,
                  "lecture_teachers"=>["Claudia Alviar"]}]
  end

  factory :stale_subject, parent: :subject do
    refreshed_at 5.minutes.ago
  end
end

