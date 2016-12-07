ActiveSupport::Notifications.subscribe '/cache_.*\.active_support/' do |*args|
  puts "Cache event! - #{args}"
end
