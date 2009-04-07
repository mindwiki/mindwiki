require 'test_helper'

class SyncLogTest < ActiveSupport::TestCase
  fixtures :graphs, :notes, :edges, :users

  test "Creation" do
    assert_difference "SyncLog.count" do
      s = SyncLog.new()
      
      # graph_id is NOT needed
      # graph_id = NULL means we push the update to all clients
      #assert_equal false, s.save
      #s.graph_id = graphs(:ruby_graph).id
            
      # no more requirements
      assert s.save
    end
  end

end
