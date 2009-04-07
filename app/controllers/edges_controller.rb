class EdgesController < ApplicationController
  # GET /edges/1
  # GET /edges/1.xml
  def show
    @edge = Edge.find(params[:id])

    respond_to do |format|
      format.xml  { render :xml => @edge }
    end
  end

  # POST /edges
  # POST /edges.xml
  def create
    @edge = Edge.new(params[:edge])

    respond_to do |format|
      if @edge.save
        SyncLog.edge_update(@edge.source_note.graph.id, @edge, params[:clientId])
        format.xml  { render :xml => @edge.to_xml(:only => [:id]), :status => :created }
      else
        format.xml  { render :xml => @edge.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /edges/1
  # PUT /edges/1.xml
  def update
    @edge = Edge.find(params[:id])

    respond_to do |format|
      if @edge.update_attributes(params[:edge])
        SyncLog.edge_update(@edge.source_note.graph.id, @edge, params[:clientId])
        format.xml  { head :ok }
      else
        format.xml  { render :xml => @edge.errors, :status => :unprocessable_entity }
      end
    end
  end
  
  def destroy
    @edge = Edge.find(params[:id])
    
    @edge.destroy
    
    respond_to do |format|
      format.html { head :ok }
      format.xml { head :ok }
    end
  end
end
