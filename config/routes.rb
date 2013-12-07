Uninortehorarios::Application.routes.draw do
  	root :to => "home#index"
  	get "home/generate"
  	get "subject/autocomplete"
  	post "subject/courses"
end
