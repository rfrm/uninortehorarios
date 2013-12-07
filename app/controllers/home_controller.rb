class HomeController < ApplicationController
	def generate
	  	@subjects = Subject.all
	end
end
