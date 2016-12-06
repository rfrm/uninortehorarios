# Encoding: utf-8

require 'typhoeus'
require 'nokogiri'
require 'celluloid'
require 'celluloid/autostart'

class Getter
  include Celluloid

  def self.code_list
    file_path = File.join Rails.root, 'config', 'codes.yml'
    raise LoadError, "Couldn't find the file 'codes.yml' in #{file_path}" unless File.exists?(file_path)
    YAML.load File.read(file_path)
  end

  def current_period
    current_year, current_month = Time.now.year, Time.now.month
    period_code = if current_month < 6
      '10'
    elsif current_month >= 6 && current_month < 12
      '30'
    elsif current_month == 12
      current_year += 1
      '10'
    end
    "#{current_year}#{period_code}"
  end

  def current_period_name
    "Horarios #{current_semester} #{current_period}"
  end

  def current_semester
    Time.now.month <= 5 ? 'primer semestre' : 'segundo semestre'
  end
end

