class SyncLog < ActiveRecord::Base

  class << self # Class methods

    # GRAPH
    
    def graph_destroy(graph_id, user)
      params = { :graph_destroy => graph_id }
      # FIXME: user is never properly initialized
      if !user.nil?
        if !user.login.nil?
          params[:user] = user.login
        end
      end
      @l = SyncLog.new({:graph_id => graph_id, :params => params.to_json})
      @l.save
    end

    def graph_update(graph)
      @l = SyncLog.new({:graph_id => graph.id, :params => graph.to_json(:only => [:name, :color])})
      @l.save
    end
    
    
    # NOTE
    def note_destroy(graph_id, note_id)
      params = { :note_destroy => note_id }
      @l = SyncLog.new({:graph_id => graph_id, :params => params.to_json})
      @l.save
    end    

    def note_update(graph_id, note, clientId)
      @l = SyncLog.new({:graph_id => graph_id, :sessionid => clientId, :params => note.to_json()})
      @l.save
    end

    def note_create_new(graph_id, note, clientId)
      @l = SyncLog.new({:graph_id => graph_id, :sessionid => clientId, :params => note.to_json()})
      @l.save
    end
    
    # EDGE
    def edge_destroy(graph_id, edge_id)
      params = { :edge_destroy => edge_id }
      @l = SyncLog.new({:graph_id => graph_id, :params => params.to_json})
      @l.save
    end    
    
    def edge_update(graph_id, edge, clientId)
      @l = SyncLog.new({:graph_id => graph_id, :sessionid => clientId, :params => edge.to_json()})
      @l.save
    end
    
    # ARTICLE
    def article_update(art)
      # :methods => :redcloth_rendering includes the derived attribute into the json
      @l = SyncLog.new({:graph_id => nil, :params => art.to_json(:methods => :redcloth_rendering, :include => {:notes => { :only => :id}})})
      @l.save
    end

    # Article destroying is not checked, since clients cannot destroy articles without
    # deleting a note.    

  end # End "class << self"
end
