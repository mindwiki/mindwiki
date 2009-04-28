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
