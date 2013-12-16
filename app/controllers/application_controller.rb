class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :redirect_to_linku

  def redirect_to_linku
  	redirect_to "http://linku.herokuapp.com"
  end
end