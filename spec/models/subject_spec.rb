require 'rails_helper'

describe Subject do
  let(:fresh_subject){ FactoryGirl.create :fresh_subject }

  it "Updates the refreshed_at if the parsed data changes" do
    expect {
      fresh_subject.parsed_data = [{"mat"=>"ALE1031", "nrc"=>"5166", "name"=>"EXIGENCIA ALEMAN I",
                  "schedule"=>{"R"=>[6, 7], "T"=>[6, 7]}, "available"=>10,
                  "lecture_teachers"=>["Claudia Alviar"]}]
      fresh_subject.save
    }.to change(fresh_subject, :refreshed_at)
  end

  it "Does not update the refreshed_at if the parsed_data does not change" do
    expect {
      fresh_subject.code = "ALE1032"
      fresh_subject.save
    }.to_not change(fresh_subject, :refreshed_at)
  end

  it "has the refreshed_at timezone set to UTC" do
    fresh_subject.parsed_data = [{"mat"=>"ALE1031", "nrc"=>"5166", "name"=>"EXIGENCIA ALEMAN I",
                "schedule"=>{"R"=>[6, 7], "T"=>[6, 7]}, "available"=>10,
                "lecture_teachers"=>["Claudia Alviar"]}]
    fresh_subject.save
    puts fresh_subject.refreshed_at
    expect(fresh_subject.refreshed_at.time.zone).to eq("UTC")
  end
end

