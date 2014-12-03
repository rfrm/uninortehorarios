class CreateSubjects < ActiveRecord::Migration
  def change
    create_table :subjects do |t|
      t.string :name,           null: false
      t.string :code,           null: false
      t.string :escaped_name,   null: false
      t.boolean :active,        default: true

      t.timestamps
    end
  end
end
