require 'rails_helper'

describe SubjectsController do
  let(:stale_subject){ FactoryGirl.create :stale_subject }
  let(:fresh_subject){ FactoryGirl.create :fresh_subject }

  context "Subject is stale" do
    it "Calls the updater if the requested subject is stale" do
      expect(SubjectUpdaterService).to receive(:update).with("XXX")
      get :show, id: stale_subject.code
    end
  end

  context "Subject is fresh" do
    it "Should not call the updater" do
      expect(SubjectUpdaterService).to_not receive(:update)
      get :show, id: fresh_subject.code
    end

    it "Assigns the fresh_subject" do
      get :show, id: fresh_subject.code
      expect(assigns[:subject]).to eq(fresh_subject)
    end

    it "Returns the max age header" do
      get :show, id: fresh_subject.code
      /max-age=(?<max_age>\d), public/ =~ response.headers["Age"]
      expect(max_age.to_i).to be <= 120
    end
  end
end

