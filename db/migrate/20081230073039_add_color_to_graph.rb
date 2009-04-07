class AddColorToGraph < ActiveRecord::Migration
  def self.up
    add_column :graphs, :color, :string
  end

  def self.down
    remove_column :graphs, :color
  end
end
