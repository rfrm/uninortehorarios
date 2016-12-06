class HomeController < ApplicationController

  def index
    #
    # Modify the :etag value everytime a change is made to the
    # view rendered by this action to tell the browser
    # to update their cached version of the page.
    #
    fresh_when etag: '8e5db4379e43f5655185065849574244', public: true
  end
end
