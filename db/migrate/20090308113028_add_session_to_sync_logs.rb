class AddSessionToSyncLogs < ActiveRecord::Migration
  def self.up
    add_column :sync_logs, :sessionid, :string
  end

  def self.down
    remove_column :sync_logs, :sessionid
  end
end
