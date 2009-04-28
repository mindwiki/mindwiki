# The MIT License
# 
# Copyright (c) 2009 Sami Blommendahl, Mika Hannula, Ville Kivelä,
# Aapo Laitinen, Matias Muhonen, Anssi Männistö, Samu Ollila, Jukka Peltomäki,
# Matias Piipari, Lauri Renko, Aapo Tahkola, and Juhani Tamminen.
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
# 
require 'test_helper'

class EdgeTest < ActiveSupport::TestCase
  fixtures :edges, :notes, :graphs

  test "Creation" do
    assert_difference "Edge.count" do
      edge = Edge.new({:name => "Test edge", :color => "#000000"})
      
      # Lacking target and source notes
      assert_equal false, edge.save
      # ..fixing
      edge.source_note = Note.find(notes(:ruby_note).id)
      edge.target_note = Note.find(notes(:redcloth_example_note).id)
      
      # Target and source in different graphs, shouldn't work
      assert_equal false, edge.save
      # ..fixing
      edge.target_note = Note.find(notes(:matsumoto_yt_note).id)
      
      assert edge.save
    end
  end
  
  test "Deletion" do
    assert_difference "Edge.count", -1 do
      assert_difference "SyncLog.count", 1 do
        e = Edge.find(edges(:ruby_oo_edge).id)
        assert e.destroy
      end
    end
  end
  
  test "Name change test" do
    e = Edge.find(edges(:ruby_oo_edge).id)
    
    assert e.update_attributes(:name => "New name")
    
    assert_equal false, e.update_attributes(:name => '<script>alert("asdf");</script>Muhuhuhuu')
  end
  
  test "Target changing test" do
    e = Edge.find(edges(:ruby_oo_edge).id)
    e.target_note = Note.find(notes(:matsumoto_yt_note).id)
    assert e.save
    
    # Needs to be in the same graph
    e.target_note = Note.find(notes(:redcloth_example_note).id)
    assert_equal false, e.save
    
    # Can't make recursive (self-to-self) edges
    e.target_note = Note.find(notes(:ruby_note).id)
    assert_equal false, e.save

    # No duplicate edges! (Ruby -> Matsumoto -note already exists in fixtures)
    e.target_note = Note.find(notes(:matsumoto_note).id)
    assert_equal false, e.save

    e.target_note = nil
    assert_equal false, e.save
  end

  test "Source changing test" do
    e = Edge.find(edges(:ruby_oo_edge).id)
    e.source_note = Note.find(notes(:matsumoto_yt_note).id)
    assert e.save
    
    # Needs to be in the same graph
    e.source_note = Note.find(notes(:redcloth_example_note).id)
    assert_equal false, e.save

    # Can't make recursive (self-to-self) edges
    e.source_note = Note.find(notes(:oo_note).id)
    assert_equal false, e.save

    e.source_note = nil
    assert_equal false, e.save
  end

  test "Bidirectional uniqueness test" do
    edge = Edge.new({:name => "Test edge", :color => "#000000"})
      
    # There already is an edge: ruby_note -> oo_note
    # So it shouldn't be possible to create: oo_note -> ruby_note
    edge.source_note = Note.find(notes(:oo_note).id)
    edge.target_note = Note.find(notes(:ruby_note).id)
    assert_equal false, edge.save
  end

end
