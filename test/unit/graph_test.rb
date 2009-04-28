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

class GraphTest < ActiveSupport::TestCase
  fixtures :graphs, :notes, :edges, :users

  test "Creation" do
    assert_difference "Graph.count" do
      graph = Graph.new({:name => ""})
      
      # name can not be blank
      assert_equal false, graph.save
      graph.name = "New Graph!"
      
      # user is needed
      assert_equal false, graph.save
      graph.user = User.find(users(:mwiki).id)
      
      # color is needed, too
      assert_equal false, graph.save
      graph.color = "#abba10"
      
      # no more requirements
      assert graph.save
    end
  end

  test "Destroy cascading" do
    # Test fixture Ruby-graph has four notes/articles and three edges. They should get deleted, too.
    assert_difference "Graph.count", -1 do
      assert_difference "Note.count", -4 do
        assert_difference "Article.count", -4 do
          assert_difference "Edge.count", -3 do
            assert_difference "SyncLog.count", 5 do # :dependent => :delete_all does not call destroy-methods (no edges)
              graph = Graph.find(graphs(:ruby_graph).id)
              assert graph.destroy
            end
          end
        end
      end
    end
  end

  # Color acceptance (copy-pasted from note_test.rb)
  test "Color changing test" do
    note = Graph.find(graphs(:ruby_graph).id)
        
    # Normal six-figure hexes should work fine, three-figures shouldn't
    assert note.update_attributes(:color => "#b1b1b1")
    assert note.update_attributes(:color => "#aBcDeF")
    assert_equal false, note.update_attributes(:color => "#ccc")
    assert_equal false, note.update_attributes(:color => "b1b1b1")
                            
    # 16 W3C standard colors should work, e.g. yellow works, pink doesn't
    assert note.update_attributes(:color => "yellow")
    assert note.update_attributes(:color => "yElLoW")
    assert_equal false, note.update_attributes(:color => "pink")
  end

  test "Extent finding text" do
    graph = Graph.find(graphs(:ruby_graph).id)
    extents = graph.get_extents()
    assert_equal 50, extents[:minX]
    assert_equal 10, extents[:minY]
    assert_equal 900, extents[:maxX]
    assert_equal 650, extents[:maxY]
  end                                               

  test "Viewport loading" do
    graph = Graph.find(graphs(:ruby_graph).id)

    # Example graph should have four notes total
    assert_equal 4, graph.notes.count

    # Should hit one note within the viewport, and load both directly related notes
    # but not the third one, which is out of the viewport and not directly related.
    notes_in_vp_and_related = graph.notes_within(0,0,100,100)
    assert_equal 3, notes_in_vp_and_related.count
  end

end
