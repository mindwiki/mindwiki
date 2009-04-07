class GraphsController < ApplicationController
  # GET /graphs
  # GET /graphs.xml
  def index
    @graphs = Graph.find(:all, :readonly => true)

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @graphs }
    end
  end

  # GET /graphs/1
  # GET /graphs/1.xml
  def show
    @graph = Graph.find(params[:id])
    @graphnotes = @graph.notes;

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @graph }
    end
  end

  # GET /graphs/new
  # GET /graphs/new.xml
  def new
    @graph = Graph.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @graph }
    end
  end

  # GET /graphs/1/edit
  def edit
    @graph = Graph.find(params[:id])
  end

  # POST /graphs
  # POST /graphs.xml
  def create
    @graph = Graph.new(params[:graph])
    @graph.user = current_user

    respond_to do |format|
      if @graph.save
        format.html { redirect_to(@graph) }
        format.xml  { render :xml => @graph, :status => :created, :location => @graph }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @graph.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /graphs/1
  # PUT /graphs/1.xml
  def update
    @graph = Graph.find(params[:id])

    respond_to do |format|
      if @graph.update_attributes(params[:graph])
        format.html { redirect_to(@graph) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @graph.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /graphs/1
  # DELETE /graphs/1.xml
  def destroy
    @graph = Graph.find(params[:id], :select => "id")
    @graph.destroy

    respond_to do |format|
      format.html { redirect_to(graphs_url) }
      format.xml  { head :ok }
    end
  end
  
  # Renders note IDs
  def get_note_ids
    @graph = Graph.find(params[:id],:select => "id")
    @graphnotes = @graph.notes; # FIXME: Fetches more than ids from the db

    respond_to do |format|
      format.xml { render :xml => @graphnotes.to_xml(:only => [:id]) }
    end
  end
  
  # Returns the color for the graph
  def get_color
    respond_to do |format|
      if params[:id].nil?
        format.text { render :text => "#dddddd" }
      end
      if @graph = Graph.find(params[:id], :select => "color", :readonly => true)
        format.text { render :text => @graph.color }
      else
        format.text { render :text => "#dddddd" }
      end
    end
  end
  
  # Returns graph extents and midpoint.
  def get_extents
    respond_to do |format|
      if params[:id].nil?
        format.xml { render :xml => @graph.errors, :status => :unprocessable_entity }
      end
      if @graph = Graph.find(params[:id])
        format.xml { render :xml => @graph.extents_to_xml() }
      end
    end
  end
  
  # Returns all notes within a certain viewport
  def get_notes_in_vport
    respond_to do |format|
      if params[:id].nil?
        format.xml { render :xml => @graph.errors, :status => :unprocessable_entity }
      end
      @graph = Graph.find(params[:id],:select => "id")
      @vp_notes = @graph.notes_within(params[:vport_x], params[:vport_y], params[:vport_width], params[:vport_height]);
      format.xml { render :xml => @vp_notes.to_xml(:include => [:article, :edges_to, :edges_from]) }
    end
  end
  
  # Returns all notes with given name
  def get_notes_by_name
    respond_to do |format|
      if params[:id].nil?
        format.xml { render :xml => @graph.errors, :status => :unprocessable_entity }
      end
      @graph = Graph.find(params[:id],:select => "id")
      @n_notes = @graph.notes_by_name(params[:name]);
      format.xml { render :xml => @n_notes.to_xml(:include => [:article, :edges_to, :edges_from]) }
    end
  end

  def updated_since
    respond_to do |format|
      if params[:id].nil? || params[:timestamp].nil?
        format.xml { render :xml => @graph.errors, :status => :unprocessable_entity }
        format.json { render :json => @graph.errors, :status => :unprocessable_entity }
      end
      @graph = Graph.find(params[:id])
      # SQL-injection-safe?
      # TODO: Check for changes in articles or edges, too.
      @changed_notes = @graph.notes.find(:all, :conditions => ["updated_at > ? OR created_at > ?", params[:timestamp], params[:timestamp]])
      format.xml { render :xml => @changed_notes.to_xml(:include => [:article, :edges_to, :edges_from]) }
      format.json { render :json => @changed_notes.to_json(:include => [:article, :edges_to, :edges_from]) }
    end
  end

  # Returns OK-header. Used for connection delay testing.
  def request_empty
    respond_to do |format|
      format.text { head :ok }
    end
  end

end #EOF
