class Edge < ActiveRecord::Base
  belongs_to :source_note, :class_name => "Note", :foreign_key => :source_id
  belongs_to :target_note, :class_name => "Note", :foreign_key => :target_id

  validates_presence_of :source_note
  validates_presence_of :target_note


  # Is the note pair unique. a->b == b->a.
  # If you want an undirected edge, use the directed-attribute.

  validates_uniqueness_of :source_id, :scope => [:target_id]
 

  def validate
    validate_color('color')
    validate_text('name')
    
    # Validate that the notes are in the same graph
    self.errors.add('target_note', ' needs to be in the same graph as the source note.') unless notes_in_the_same_graph?

    # Validate that the source and target are not the same
    self.errors.add('target_note', ' can not be the same note as the source note.') unless different_notes?

    # Validate "bidirectional" uniqueness
    self.errors.add('source_note', ' and target_note need to be a unique pairing. Use undirected edges to represent two directed edges going to opposite notes.') unless bidirectionally_unique?
  end

  # Are notes in the same graph?
  def notes_in_the_same_graph?
    if self.source_note.nil? 
      return false
    end
    if self.target_note.nil? 
      return false
    end
    return self.source_note.graph == self.target_note.graph
  end
  
  # Are notes different? As in, not the same note. (Properties besides ID can be the same, of course)
  def different_notes?
    if self.source_note.nil?
      return false
    end
    if self.target_note.nil?
      return false
    end
    return self.source_note != self.target_note
  end
  
  # Is there already a note from target to source?
  def bidirectionally_unique?
    if self.source_note.nil?
      return false
    end
    if self.target_note.nil?
      return false
    end
    return Edge.first(:conditions => {:source_id => self.target_note.id, :target_id => self.source_note.id}).nil?
  end

#  after_update { |edge| SyncLog.edge_update(edge.source_note.graph.id, edge) }
#  after_create { |edge| SyncLog.edge_update(edge.source_note.graph_id, edge) }
  def after_destroy #{ |obj| SyncLog.edge_destroy(obj.source_note.graph.id, obj.id) }
    SyncLog.edge_destroy(self.source_note.graph.id, self.id)
  end

end
