# Encoding: utf-8

class Subject < ActiveRecord::Base
  EXPIRATION = 10.minutes

  validates :code, uniqueness: true, presence: true

  def expires_in
    [refreshed_at + EXPIRATION - Time.zone.now, 0].max.seconds
  end

  def stale?
    refreshed_at + EXPIRATION < Time.zone.now
  end

  def fresh?
    Time.zone.now < refreshed_at + EXPIRATION
  end

  def needs_update?
    parsed_data.blank? || stale?
  end

  def parsed_data=(value)
    super(value)
    self.refreshed_at = Time.zone.now
  end
end

