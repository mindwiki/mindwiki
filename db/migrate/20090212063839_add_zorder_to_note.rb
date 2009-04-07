class AddZorderToNote < ActiveRecord::Migration
  def self.up
    add_column :notes, :zorder, :integer, :default => 10
  end

  def self.down
    remove_column :notes, :zorder
  end
end
