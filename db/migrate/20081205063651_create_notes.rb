class CreateNotes < ActiveRecord::Migration
  def self.up
    create_table :notes do |t|
      t.string :name
      t.integer :x
      t.integer :y
      t.integer :width
      t.integer :height
      t.string :color
      t.references :article
      t.references :graph

      t.timestamps
    end
  end

  def self.down
    drop_table :notes
  end
end
