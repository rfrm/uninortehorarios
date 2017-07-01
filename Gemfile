source 'https://rubygems.org'

ruby '2.3.3'

gem 'celluloid', '~> 0.17.2'
gem 'connection_pool'
gem 'dalli', '~> 2.7', '>= 2.7.4'
gem 'jquery-rails', '~> 4.0', '>= 4.0.5'
gem 'jquery-ui-rails', '~> 5.0', '>= 5.0.5'
gem 'kgio', '~> 2.10'
gem 'less-rails', '~> 2.7'
gem 'less-rails-bootstrap', '~> 3.3', '>= 3.3.5.0'
gem 'memcachier', '~> 0.0.2'
gem 'nokogiri', '~> 1.6', '>= 1.6.7'
gem 'newrelic_rpm', '~> 3.14', '>= 3.14.1.311'
gem 'puma', '~> 2.15', '>= 2.15.3'
gem 'rack-cache', '~> 1.5', '>= 1.5.1'
gem 'rails', '~> 4.2.0'
gem 'therubyracer', '~> 0.12.2'
gem 'uglifier', '~> 2.7', '>= 2.7.2'
gem 'typhoeus', '~> 0.8.0'

group :development do
  gem 'rubocop'
  gem 'meta_request'
  gem 'quiet_assets'
end

group :test, :development do
  gem 'byebug'
  gem 'sqlite3'
  gem 'factory_girl_rails', '~> 4.5'
end

group :test do
  gem 'rspec-rails', '~> 3.4'
end

group :production do
  gem 'heroku-deflater'
  gem 'pg'
  gem 'rails_12factor'
end
