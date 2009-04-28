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
