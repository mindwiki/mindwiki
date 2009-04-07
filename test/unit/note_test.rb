require 'test_helper'

class NoteTest < ActiveSupport::TestCase
  fixtures :notes, :edges, :graphs, :articles

  # Simple creation
  test "Simple note creation." do
    assert_difference 'Note.count' do
      note = Note.new({
        :name => "",
        :x => 10,
        :y => 10,
        :width => 300,
        :height => 200,
        :color => "#abba10",
        :zorder => 100
      })

      # Blank name shouldn't be allowed
      assert_equal false, note.save
      note.name = "New note for testing"
      
      # Reference to a graph needed!
      assert_equal false, note.save
      graph = Graph.find(graphs(:ruby_graph).id)
      note.graph = graph

      # No need for article-reference at this time. Should there be? Maybe...

      # Now it should save
      assert note.save
    end
  end
  
  test "Simple note deletion." do
    note = Note.new({
      :name => "Deletetestnote",
      :x => 10,
      :y => 10,
      :width => 300,
      :height => 200,
      :color => "#abba10"
    })
    note.graph = Graph.find(graphs(:ruby_graph).id)
    assert note.save
    
    # Deletion without article-id also tests for the nil
    # handling in the custom method after_destroy in Note.
    assert_difference "Note.count", -1 do
      note.destroy
    end
  end

  test "Destroyal cascading" do
    assert_difference "Note.count", -1 do
      # Ruby note fixture has two edges, which should get destroyed, too.
      assert_difference "Edge.count", -2 do
        assert_difference "Article.count", -1 do
          note = Note.find(notes(:ruby_note).id)
          assert note.destroy
        end
      end
    end
  end

  test "Destroyal cascading with multiple references to the same article." do
    # A new note with a reference to the same Ruby article, as the Ruby note has.
    nn = Note.new({
        :name => "New note",
        :x => 10,
        :y => 10,
        :width => 300,
        :height => 200,
        :color => "#abba10"
    })
    nn.graph = Graph.find(graphs(:ruby_graph).id)
    nn.article = Article.find(articles(:ruby_art).id)
    nn.save # No need to assert. Article.count takes care of unsuccessful save.
    
    # Test to see that the note and the edges get destroyed, but not the article
    assert_difference "Note.count", -1 do
      # Ruby note fixture has two edges, which should get destroyed, too.
      assert_difference "Edge.count", -2 do
        assert_difference "Article.count", 0 do # Article shouldn't get deleted, as it is still in use
          note = Note.find(notes(:ruby_note).id)
          assert note.destroy
        end
      end
    end
  end

  # Position acceptance
  test "Position changing test" do
    note = Note.find(notes(:ruby_note).id)
    
    # Currently even negative integers are okay
    assert note.update_attributes(:x => 0)
    assert note.update_attributes(:y => 0)
    assert note.update_attributes(:x => 100)
    assert note.update_attributes(:y => 100)
    assert note.update_attributes(:x => -9999)
    assert note.update_attributes(:y => -9999)
    
    # Only integers, though
    assert_equal false, note.update_attributes(:x => 4.6)
    assert_equal false, note.update_attributes(:y => 4.5)
    assert_equal false, note.update_attributes(:x => "foo")
    assert_equal false, note.update_attributes(:y => "foo")
    assert_equal false, note.update_attributes(:x => nil)
    assert_equal false, note.update_attributes(:y => nil)
  end

  # Size
  test "Size changing test" do
    note = Note.find(notes(:ruby_note).id)
    
    assert note.update_attributes(:width => 300)
    assert note.update_attributes(:height => 300)
    assert note.update_attributes(:width => 1000)
    assert note.update_attributes(:height => 500)
    assert note.update_attributes(:width => 9998)
    assert note.update_attributes(:height => 9998)
    
    assert_equal false, note.update_attributes(:width => 4.5)
    assert_equal false, note.update_attributes(:height => 4.5)
    assert_equal false, note.update_attributes(:width => "foo")
    assert_equal false, note.update_attributes(:height => "foo")
    assert_equal false, note.update_attributes(:width => nil)
    assert_equal false, note.update_attributes(:height => nil)

    # Too small
    assert_equal false, note.update_attributes(:width => 10)
    assert_equal false, note.update_attributes(:height => 10)

    # Too big
    assert_equal false, note.update_attributes(:width => 9999)
    assert_equal false, note.update_attributes(:height => 9999)

    # No negatives
    assert_equal false, note.update_attributes(:width => -300)
    assert_equal false, note.update_attributes(:height => -300)
  end
  
  # Color acceptance
  test "Color changing test" do
    note = Note.find(notes(:ruby_note).id)

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
  
end
