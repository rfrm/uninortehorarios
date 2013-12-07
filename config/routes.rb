Uninortehorarios::Application.routes.draw do
  	root :to => "home#index"
  	get "home/generate"
  	post "subject/courses"
end
