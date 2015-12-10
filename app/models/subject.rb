# Encoding: utf-8
class Subject < ActiveRecord::Base
  attr_accessible :code, :name, :active

  # Validations
  validates :name, :code,  presence: true
  validates :code, uniqueness: true

  # Callbacks
  before_save :format_attributes

  # Methods
  def format_attributes
    self.name = escape_attr(self.name)
  end

  private
  def escape_attr(attribute)
    attribute = attribute.strip.squeeze(" ")
    attribute = attribute.gsub("&","y")
    attribute = attribute.gsub(/[^0-9a-zA-ZáéíóúÁÉÍÓÚÑñ'\s]/,"")
    attribute = attribute.gsub("Ñ","ñ")
    attribute = attribute.gsub(/[Áá]/,"a")
    attribute = attribute.gsub(/[Éé]/,"e")
    attribute = attribute.gsub(/[Íí]/,"i")
    attribute = attribute.gsub(/[Óó]/,"o")
    attribute = attribute.gsub(/[Úú]/,"u").downcase
  end
end
