source 'https://rubygems.org'

ruby '2.0.0'
gem 'typhoeus'
gem 'nokogiri'
gem 'jquery-rails'
gem 'rails', '3.2.15'
gem 'jquery-ui-rails'

group :production do
	gem 'pg'
	gem "unicorn", "~> 4.6.2"
	gem 'heroku-deflater'
	gem 'rails_12factor'
end

group :development do
	gem 'sqlite3'
  	gem 'meta_request'
end

group :assets do
	gem 'sass-rails',   '~> 3.2.3'
	gem 'coffee-rails', '~> 3.2.1'
	gem 'uglifier', '>= 1.0.3'
end
