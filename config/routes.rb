Rails.application.routes.draw do
  root :to => 'home#index'
  get "home/generate"

  resources "subjects", :only => "show" do
    collection do
      get "autocomplete"
    end
  end
end

