Rails.application.routes.draw do
  root :to => 'home#index'
  get "home/generate"
  resources "subjects", :only => "show"
end

