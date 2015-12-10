class RemoveUnusedFieldsToSubjects < ActiveRecord::Migration
  def change
    change_table :subjects do |t|
      t.remove :escaped_name, :active, :created_at, :updated_at
    end
  end
end

