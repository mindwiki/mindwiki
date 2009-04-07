class AddTypeToArticle < ActiveRecord::Migration
  def self.up
    add_column :articles, :content_type, :integer, :default => 1
  end

  def self.down
    remove_column :articles, :type
  end
end
