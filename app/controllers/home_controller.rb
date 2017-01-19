class HomeController < ApplicationController
  def index
    fresh_when etag: '32747fdf7cc0dc321ea967cbe89e3b06', public: true
  end

  def generate
    fresh_when etag: '8e5db4379e43f5655185065849574247', public: true
  end
end
