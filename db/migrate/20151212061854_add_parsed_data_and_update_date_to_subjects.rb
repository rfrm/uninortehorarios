class AddParsedDataAndUpdateDateToSubjects < ActiveRecord::Migration
  def change
    remove_column :subjects, :name
    add_column :subjects, :parsed_data, :jsonb, default: {}
    add_column :subjects, :refreshed_at, :datetime
    add_index :subjects, :code, using: :hash
  end
end
