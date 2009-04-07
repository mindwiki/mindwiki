class SyncLogs < ActiveRecord::Migration
  def self.up
    create_table :sync_logs do |t|
      t.timestamp	:created_at
      t.integer		:graph_id
      t.text		:params
    end
    add_index (:sync_logs, [:created_at, :graph_id], :name => :time_graph_index)
  end

  def self.down
    drop_table :sync_logs
  end
end
