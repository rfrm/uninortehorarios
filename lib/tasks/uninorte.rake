namespace :uninorte do
  # Requires
  require_relative '../unscrapper.rb'

  # Tasks
  desc 'Fetch uninorte subject list from uninorte webpage and update the db'
  task :subjects => :environment do
    perflain "fetching subjects...\n", '...done' do
      Subject.update_all(active: false)
      Unscrapper::Subject.all.each do |subj_attrs|
        begin
          subj = Subject.find_by_code(subj_attrs[:code])
          unless subj
            subj = Subject.new(subj_attrs)
            subj.save!
            puts "- #{subj_attrs[:name]}"
          else
            subj.update(active: true) unless subj.active
          end
        rescue => e
          puts "------- #{subj_attrs[:name]} -----------"
          puts e.message
        end
      end
    end
  end
end

# Methods
def perflain(doing_txt, done_txt, &block)
  print doing_txt
  result = block.call
  puts done_txt
  result
end
