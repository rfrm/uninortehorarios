Uninortehorarios::Application.routes.draw do
  root :to => "app#index"
  get "/subjects" => "subject#index"
  
  get "home/generate"
  get "subject/autocomplete"
  post "subject/courses"
end
