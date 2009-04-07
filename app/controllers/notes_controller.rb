class NotesController < ApplicationController
  # GET /notes/1
  # GET /notes/1.xml
  def show
    @note = Note.find(params[:id])

    respond_to do |format|
      format.xml { render :xml => @note.to_xml(:include => [:article, :edges_to, :edges_from]) }
    end
  end

  # POST /notes
  # POST /notes.xml
  def create
    @article = Article.create(:content => params[:article_content])
    @graph = Graph.find(params[:graph_id], :select => "id", :readonly => true)
    @note = Note.new(params[:note])
    @note.article = @article
    @note.graph = @graph

    respond_to do |format|
      if @note.save
        SyncLog.note_create_new(@note.graph.id, @note, params[:clientId])
        format.xml { render :xml => @note.to_xml(:only => [:id]), :status => :created }
      else
        format.xml { render :xml => @note.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /notes/1
  # PUT /notes/1.xml
  def update
    @note = Note.find(params[:id])

    # Warning. jQuery doesn't validate "head :ok" as valid without (for example) 'dataType: "html"'.

    respond_to do |format|
      if @note.update_attributes(params[:note])
        SyncLog.note_update(@note.graph.id, @note, params[:clientId])
        format.xml  { head :ok }
      else
        format.xml  { render :xml => @note.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /notes/1
  # DELETE /notes/1.xml
  def destroy
    @note = Note.find(params[:id])
    
    @note.destroy

    respond_to do |format|
      format.html { head :ok }
      format.xml { head :ok }
    end
  end
  
  # Updates note content and return a RedCloth rendering for javascript usage.
  def update_content
    @note = Note.find(params[:id], :select => "article_id")

    respond_to do |format|
      if @note.article.update_attribute(:content, params[:newContent])
        # Technically html :)
        format.text { render :text => RedCloth.new(white_list(@note.article.content),[:filter_styles]).to_html(:textile, :youtube, :note) }
      else
        format.text { render :text => "<p>Content update error.</p>" }
      end
    end
  end
  
end
