class CreateEdges < ActiveRecord::Migration
  def self.up
    create_table :edges do |t|
      t.integer :source_id
      t.integer :target_id
      t.boolean :directed
      t.string :name
      t.string :color

      t.timestamps
    end
  end

  def self.down
    drop_table :edges
  end
end
