// Server synchronization

// Get means getting information FROM the server.
// Set means informing the server about a change in the client.

function Sync(graph) {

 /****************************************************************************
   Default values
  ****************************************************************************/

  var thissync = this;     // For submethods
  this.graph = graph;
  this.refreshTime = 2500; // How ofter do we poll the server for updates? (in milliseconds)
  this.timestamp = "";     // The latest timestamp from the server
  
  // Generate (hopefully) unique id for this client.
  // Used for ignoring syncs originating from oneself.
  this.uniqueId = this.generateUniqueId();  

 /****************************************************************************
   Global ajax functions:

   Loading the spinner during ajax-calls
  ****************************************************************************/

  this.loadingDiv = document.createElement("div");
  $(this.loadingDiv).addClass("loadingDiv");
  $("#world").append(this.loadingDiv);

  // Makes all ajax calls automatically call the loading()-method of the graph,
  // so we do not necessarily need to manually call them all over the code
  $(function() {
    $(document).ajaxSend(function(e, request, options){
      thissync.graph.loading(true);
      // TODO: Insert connection checking here?
    });
    $(document).ajaxStop(function(e, request, options){
      thissync.graph.loading(false);
    });
  });
  
  jQuery.ajaxSetup({ async: thissync.graph.asyncAjax });

} // end constructor


/****************************************************************************
  Automatic refreshing method

  Initial call of this function is at the end of the graph constructor.

  To have checkServerForUpdates within Sync needs different workarounds for different browsers, 
  because setTimeout changes scope. Therefore global.

 ****************************************************************************/

function checkServerForUpdates(syncObject){
  var sync = syncObject;
  var thisgraph = syncObject.graph;

  $.ajax({
    global: false, // Disables the spinner and all other possible global functions
    url: "/check_for_updates/" + sync.graph.id,
    data: { "timestamp" : sync.timestamp },
    dataType: "json",
    success: function(data){
      // Update the timestamp
      if(data.time) sync.timestamp = data.time;


      // Handle the updates      
      var len = data.updates.length;
      for(var i=0;i<len;i++) {
        // TODO: Maybe sort the data.updates-array first to avoid unfortunate conflicts?

        // Ignore updates made by oneself
        if(data.updates[i].sync_log.sessionid != null || data.updates[i].sync_log.sessionid != "")
          if(parseInt(data.updates[i].sync_log.sessionid) == sync.uniqueId)
            continue; // jumps to the next iteration in the for-loop
        
        // Parameters for this particular update
        var params = JSON.parse(data.updates[i].sync_log.params);

        // GRAPH UPDATE
        if(params.graph != null){
           $("#mindwiki_world").css({"backgroundColor" : params.graph.color});
           $(".graphNameLink").html(params.graph.name);
           document.title = params.graph.name + " (MindWiki)";
        }

        // GRAPH DESTROY
        else if(params.graph_destroy){
          // TODO: Go to offline-mode and give an option to upload the local copy to the server as a new graph again.
          alert("This graph has been destroyed by another user. This graph will not work correctly any further.");
        }
        
        // NOTE UPDATE
        else if(params.note != null){
          var n = thisgraph.getNoteById(params.note.id);
          if(!n) {
            // NEW note
            n = new Note(thisgraph);
            n.id = params.note.id;
            n.name = params.note.name;
            n.x = params.note.x;
            n.y = params.note.y;
            n.color = params.note.color;
            n.width = params.note.width;
            n.height = params.note.height;
            n.zorder = params.note.zorder;
            thisgraph.notes.push(n);
            n.redraw();
            thisgraph.runningZ = thisgraph.runningZ < n.zorder ? n.zorder : thisgraph.runningZ;
          }
          else{
            // OLD note
            n.name = params.note.name;
            n.x = params.note.x;
            n.y = params.note.y;
            n.color = params.note.color;
            n.width = params.note.width;
            n.height = params.note.height;
            n.zorder = params.note.zorder;
            n.update();
          }
        }

        // NOTE DESTROY
        else if(params.note_destroy){
          var note = thisgraph.getNoteById(params.note_destroy);
          if(note){
            var thisnote = note;
           thisgraph.detachControls(thisnote);

  // Copypasta from Note.remove
  
  // First hide/delete edges and the note from client viewing:
  if(note.edgesTo != null){
    for(var i=0;i<note.edgesTo.length;i++){
      // Disassociate from the other note  
      note.edgesTo[i].startNote.disconnectEdgeFromById(note.edgesTo[i].id);
      // Erase the edge from the display
      note.edgesTo[i].erase();
      note.graph.disconnectEdge(note.edgesTo[i].id);
    }
  }  
  if(note.edgesFrom != null){
    for(var i=0;i<note.edgesFrom.length;i++){
      // Disassociate from the other note
      note.edgesFrom[i].endNote.disconnectEdgeToById(note.edgesFrom[i].id);
      // Erase the edge from the display
      note.edgesFrom[i].erase();
      note.graph.disconnectEdge(note.edgesFrom[i].id);

    }
  }  
  note.deleteDivFromDom();

  // TODO: Have graph object call the sync/delete also.
  // Notify the graph object
  thisgraph.disconnectNote(note.id);

            delete note;
            note = null;
          }
        }

        // EDGE UPDATE
        else if(params.edge != null){
          var edgeCandidate = thisgraph.getEdgeById(params.edge.id);
          if(edgeCandidate != null){
            // Edge already exists. Just update the properties.
            thisgraph.updateEdge(params.edge.id, params.edge.name, params.edge.color, params.edge.source_id, params.edge.target_id, params.edge.directed);
          }
          else{
            // Edge is not loaded, yet. Check for client-side note references, and add if possible.
            var src = thisgraph.getNoteById(params.edge.source_id);
            var trg = thisgraph.getNoteById(params.edge.target_id);
            if(src != null && trg != null){
              var e = new Edge(thisgraph);
              e.id = params.edge.id;
              thisgraph.edges.push(e);
              e.startNote = src;
              e.endNote = trg;
              e.startNote.edgesFrom.push(e);
              e.endNote.edgesTo.push(e);
              e.setTitle(params.edge.name);
              e.setColor(params.edge.color);
              e.setDirected(params.edge.directed);
              e.update();
              e.draw();
            }
          }
        }

        // EDGE DESTROY
        else if(params.edge_destroy != null){
          var edge = thisgraph.getEdgeById(params.edge_destroy);
          if(edge){
            // Copypaste from Edge.prototype.remove (without informing the server)
            edge.erase();
            if(edge.selected) thisgraph.detachControlsFromEdge(edge);
            edge.startNote.disconnectEdgeFromById(edge.id);
            edge.endNote.disconnectEdgeToById(edge.id);
            thisgraph.disconnectEdge(edge.id);
            delete edge;
          }
        }

        // ARTICLE UPDATE
        else if(params.article != null){
          var noteRefCount = params.article.notes.length;
          var noteRefCountPtr = 0;
          // One article can be the info source for multiple notes
          for(;noteRefCountPtr < noteRefCount; noteRefCountPtr++){
            var noteCandidate = thisgraph.getNoteById(params.article.notes[noteRefCountPtr].id)
            if(noteCandidate != null){ // Note exists at the client
              noteCandidate.editableContent = params.article.content;
              noteCandidate.content = params.article.redcloth_rendering;
              noteCandidate.update();
            }
          }
        }
      }


      // Update the possibly new extents
      if(data.extents) {
        var e = data.extents;
        thisgraph.extents.min.x = e.minX;
        thisgraph.extents.min.y = e.minY;
        thisgraph.extents.max.x = e.maxX;
        thisgraph.extents.max.y = e.maxY;
        thisgraph.vp.setScale(thisgraph.vp.callerScale);
        thisgraph.extents.mid.x = Math.round((thisgraph.extents.min.x+thisgraph.extents.max.x)/2);
        thisgraph.extents.mid.y = Math.round((thisgraph.extents.min.y+thisgraph.extents.max.y)/2);
      }

    }
  });


  setTimeout(function(){checkServerForUpdates(sync);}, sync.refreshTime, sync);
}


/****************************************************************************
  Update sync-object's timestamp from server returned data
 ****************************************************************************/

Sync.prototype.updateTimestamp = function(data){
  var sync = this;
 

  $("note",data).each(function(i){
      sync.updateTimestampIfBigger( $(this).find("updated-at:first").text() );
      sync.updateTimestampIfBigger( $(this).find("created-at:first").text() );

      $("article",this).each(function(j){ // There's really only one :)
        sync.updateTimestampIfBigger( $(this).find("updated-at:first").text() );
        sync.updateTimestampIfBigger( $(this).find("created-at:first").text() );
      });

      // Escapes the edges-to array first, then loops edges-to -fields inside
      $("edges-to",$(this).find("edges-to:first")).each(function(k){
  
          sync.updateTimestampIfBigger( $(this).find("updated-at:first").text() );
          sync.updateTimestampIfBigger( $(this).find("created-at:first").text() );
       
      });
      // Escapes the edges-to array first, then loops edges-to -fields inside
      $("edges-from",$(this).find("edges-from:first")).each(function(l){
      
          sync.updateTimestampIfBigger( $(this).find("updated-at:first").text() );
          sync.updateTimestampIfBigger( $(this).find("created-at:first").text() );
       
      }); 
  });
}


/****************************************************************************
   Compare a timestamp to the current one, and keep the bigger one.
 ****************************************************************************/

Sync.prototype.updateTimestampIfBigger = function(s){
  this.timestamp = (this.timestamp < s) ? s : this.timestamp;
}


/****************************************************************************
  Update extents from the server. 
 ****************************************************************************/

Sync.prototype.updateExtents = function(){
  var thissync = this;
  var thisgraph = this.graph;

  // Gets extents of the graph and calculates the middle point, also.
  $.ajax({
    url: "/graphs/get_extents/" + thissync.graph.id,
    success: function(data){
      var changed = false;
      var val;
    
      $("extents",data).each(function(i){
          $("min_point",this).each(function(j){
	    if ((val = parseInt($(this).find("x:first").text())) != thisgraph.extents.min.x) {
              thisgraph.extents.min.x = val;
	      changed = true;
	    }
	    if ((val = parseInt($(this).find("y:first").text())) != thisgraph.extents.min.y) {
              thisgraph.extents.min.y = val;
	      changed = true;
	    }
          });
          $("max_point",this).each(function(j){
	    if ((val = parseInt($(this).find("x:first").text())) != thisgraph.extents.max.x) {
              thisgraph.extents.max.x = val;
	      changed = true;
	    }
	    if ((val = parseInt($(this).find("y:first").text())) != thisgraph.extents.max.y) {
              thisgraph.extents.max.y = val;
	      changed = true;
	    }
          });

          /* See checkServerForUpdates. This didn't work there so might not work here either. */
	  if (changed == true)
	    thisgraph.vp.setScale(thisgraph.vp.callerScale);
      });
      thisgraph.extents.mid.x = Math.round((thisgraph.extents.min.x+thisgraph.extents.max.x)/2);
      thisgraph.extents.mid.y = Math.round((thisgraph.extents.min.y+thisgraph.extents.max.y)/2);
      /*thisgraph.ch.setPriorityText("Extents " + thisgraph.extents.min.x + " " + thisgraph.extents.min.y +
      " " + thisgraph.extents.max.x + " " + thisgraph.extents.max.y, 100);*/
    }
  });
}

/****************************************************************************
  Get graph information (color & extents) from the server. 
 ****************************************************************************/

Sync.prototype.initGraph = function(){
  // TODO: Have just one ajax-call to handle all graph initialization
  var thissync = this;
  var thisgraph = this.graph;
  $.ajax({
    url: "/graphs/get_color/" + thissync.graph.id,
    success: function(data){ 
      thissync.graph.color = data;
      $("#mindwiki_world").css({"backgroundColor" : data});
    }
  });
  this.updateExtents();

  // TEMPORARY for performance testing:
  // How long does it take for an empty ajax request to come back from the server?
  // On my local testing desktop, it takes about 0.8 seconds, which sounds pretty slow.
  $.ajax({ url: "/graphs/request_empty/" + thissync.graph.id });
}


Sync.prototype.tryNoteSync = function(note){
  var thissync = this;
  var failed = [];
  var errorString = "";

  /* Set synchronous mode. */
  jQuery.ajaxSetup({ async: false });
  
  if (note.createNoteDirty) /* Should discard all others. */
    this.createNote(note);

  /* It might make more sense not to pass note.color etc. as arguments.*/
  if (note.setNoteColorDirty)
    this.setNoteColor(note, note.color);

  if (note.setNoteZorderDirty)
    this.setNoteZorder(note, note.zorder);

  if (note.setNotePositionDirty)
    this.setNotePosition(note, note.x, note.y);

  if (note.setNoteSizeDirty)
    this.setNoteSize(note, note.width, note.height);

  if (note.setNoteNameDirty) // n.name is set on success so this does not work
    this.setNoteName(note, "Argh!");

  if (note.setNoteContentDirty) // Same here
    this.setNoteContent(note, "Argh!");
    
  if (note.createNoteDirty)
    failed.push("new");

  if (note.setNoteColorDirty)
    failed.push("color");

  if (note.setNoteZorderDirty)
    failed.push("zorder");

  if (note.setNotePositionDirty)
    failed.push("position");

  if (note.setNoteSizeDirty)
    failed.push("size");

  if (note.setNoteNameDirty)
    failed.push("name");

  if (note.setNoteContentDirty)
    failed.push("content");

  for (var i = 0; i < failed.length; i++) {
    errorString += failed[i];
    
    if (i < failed.length - 2)
      errorString += ", ";
    else if (i == failed.length - 2)
      errorString += " and ";
  }
  
  jQuery.ajaxSetup({ async: thissync.graph.asyncAjax });

  note.syncFailureReason = errorString;
  if (failed.length == 0)
    this.noteSyncFailureResolved(note);
  else
    this.noteSyncFailure(note);
}

/****************************************************************************
  Inform the server about a NOTE COLOR change.
 ****************************************************************************/

Sync.prototype.setNoteColor = function(note, newColor){
  var t = this;
  note.setNoteColorDirty = true;
  $.ajax({
    url: "/notes/update/"+note.id,
    data: { "note[color]" : newColor, "clientId" : t.uniqueId },
    dataType: "html",
    success: function(data){
      note.setNoteColorDirty = false;
    },
    error: function(a,b,c){
      if (t.noteSyncFailure != null)
        t.noteSyncFailure(note);
    }
  });
}


/****************************************************************************
  Inform the server about a NOTE Z-ORDER change.
 ****************************************************************************/

Sync.prototype.setNoteZorder = function(note, newZ){
  var t = this;
  note.setNoteZorderDirty = true;
  $.ajax({
    url: "/notes/update/"+note.id,
    data: { "note[zorder]" : newZ, "clientId" : t.uniqueId },
    dataType: "html",
    success: function(data){
      note.setNoteZorderDirty = false;
    },
    error: function(a,b,c){
      if (t.noteSyncFailure != null)
        t.noteSyncFailure(note);
    }
  });
}


/****************************************************************************
  Inform the server about a NOTE POSITION change.
 ****************************************************************************/

Sync.prototype.setNotePosition = function(note, newx, newy){
  var t = this;
  note.setNotePositionDirty = true;
  $.ajax({
    url: "/notes/update/"+note.id,
    dataType: "html",
    data: {
      "note[x]" : newx,
      "note[y]" : newy,
      "clientId" : t.uniqueId
    },
    success: function(data){
      note.setNotePositionDirty = false;
    },
    error: function(a,b,c){
      if (t.noteSyncFailure != null)
        t.noteSyncFailure(note);
    }
  });
}


/****************************************************************************
  Inform the server about a NOTE SIZE change.
 ****************************************************************************/

Sync.prototype.setNoteSize = function(note, neww, newh){
  var t = this;
  note.setNoteSizeDirty = true;
  $.ajax({
    url: "/notes/update/"+note.id,
    dataType: "html",
    data: {
      "note[width]" : neww,
      "note[height]" : newh,
      "clientId" : t.uniqueId
    },
    success: function(data){
      note.setNoteSizeDirty = false;
    },
    error: function(a,b,c){
      if (t.noteSyncFailure != null)
        t.noteSyncFailure(note);
    }
  });
}


/****************************************************************************
  Inform the server about a NOTE NAME change.
 ****************************************************************************/

Sync.prototype.setNoteName = function(note, newName){
  var t = this;
  var n = note;
  note.setNoteNameDirty = true;
  $.ajax({
    url: "/notes/update/"+n.id,
    dataType: "html",
    data: { "note[name]" : newName, "clientId" : t.uniqueId },
    success: function(data){
      note.setNoteNameDirty = false;
      n.name=newName;
      n.update();
    },
    error: function(a,b,c){
      if (t.noteSyncFailure != null)
        t.noteSyncFailure(note);
    }
  });
}


/****************************************************************************
  Inform the server about a NOTE CONTENT change.
 ****************************************************************************/

Sync.prototype.setNoteContent = function(note, newContent){
  var t = this;
  var n = note;
  note.setNoteContentDirty = true;
  $.ajax({
    url: "/notes/update_content/"+n.id,
    data: { "newContent" : newContent, "clientId" : t.uniqueId },
    dataType: "html",
    success: function(data){
      note.setNoteContentDirty = false;
      n.content=data;
      n.update();
    },
    error: function(a,b,c){
      if (t.noteSyncFailure != null)
        t.noteSyncFailure(note);
    }
  });
}


/****************************************************************************
  Inform the server about a NOTE DELETION.
 ****************************************************************************/

Sync.prototype.deleteNote = function(noteId){
  $.ajax({ url: "/notes/destroy/"+noteId });
}


/****************************************************************************
  Inform the server about a NEW NOTE.
  Gives the note a server assigned id number.
 ****************************************************************************/

Sync.prototype.createNote = function(note){
  var t = this;
  var thisgraph = this.graph;
  var n = note;
  n.createNoteDirty = true;
  $.ajax({
    url: "/notes/create",
    type: "POST",
    data: {
      "graph_id" : thisgraph.id,
      "note[name]" : n.name,
      "note[color]" : n.color,
      "note[x]" : n.x,
      "note[y]" : n.y,
      "note[width]" : n.width,
      "note[height]" : n.height,
      "note[zorder]" : n.zorder,
      "article_content" : n.content, "clientId" : t.uniqueId
    },
    dataType: "xml",
    success: function(data){
      $("note", data).each(function(i) {
        n.createNoteDirty = false;
        n.id = parseInt($(this).find("id:first").text());
      });
    },   
    error: function(a,b,c){
      if (t.noteSyncFailure != null)
        t.noteSyncFailure(n);
      //alert("Cannot create new note to db: "+a+b+c);
    }
  });
}


/****************************************************************************
  Get all the notes associated with the current viewport position and size.
  Also gets the directly associated notes, so we do not have to worry about 
  edges suddenly appearing while scrolling.

  TODO: Get only the notes that we already do not have in the client, or notes
        that have changed since the last update.
 ****************************************************************************/
Sync.prototype.getViewportNotes = function(x, y, w, h){
  var thissync = this;
  var thisgraph = this.graph;
  $.ajax({
    url: "/graphs/get_notes_in_vport/" + thisgraph.id,
    dataType: "xml",
    data: {
      "vport_x": x,
      "vport_y": y,
      "vport_width": w,
      "vport_height": h
    },
    success: function(data){
      //thissync.updateTimestamp(data);
      $("note",data).each(function(i){
          var tmp = new Note(thisgraph);
          tmp.id = parseInt($(this).find("id:first").text());
          tmp.name = $(this).find("name:first").text();
          tmp.x = parseInt($(this).find("x:first").text());
          tmp.y = parseInt($(this).find("y:first").text());
          tmp.width = parseInt($(this).find("width:first").text());  
          tmp.height = parseInt($(this).find("height:first").text());
          tmp.color = $(this).find("color:first").text();
          tmp.zorder = parseInt($(this).find("zorder:first").text());

          $("article",this).each(function(j){ // There's really only one :)
            tmp.content = $(this).find("content_rendered:first").text();
            var contentType = parseInt($(this).find("content_type:first").text());
            if(contentType == 1) // RedCloth-parse included
              tmp.editableContent = $(this).find("content:first").text();
          });

          // Only add the note to the graph if it is not already in.
          // TODO: Check timestamps to see if update is in order.
          if(!thisgraph.getNoteById(tmp.id)){
            thisgraph.notes.push(tmp);
            tmp.redraw();
            thisgraph.runningZ = thisgraph.runningZ < tmp.zorder ? tmp.zorder : thisgraph.runningZ;
          }

          // Escapes the edges-to array first, then loops edges-to -fields inside
          $("edges-to",$(this).find("edges-to:first")).each(function(k){
            thisgraph.updateEdge(
              parseInt($(this).find("id:first").text()),
              $(this).find("name:first").text(), 
              $(this).find("color:first").text(),
              parseInt($(this).find("source-id").text()),
              parseInt($(this).find("target-id").text()),
              // booleans are read as strings, which need to be converted properly
              $(this).find("directed:first").text() == "true"
            );
          });
          // Escapes the edges-to array first, then loops edges-to -fields inside
          $("edges-from",$(this).find("edges-from:first")).each(function(l){
            thisgraph.updateEdge(
              parseInt($(this).find("id:first").text()),
              $(this).find("name:first").text(),
              $(this).find("color:first").text(),
              parseInt($(this).find("source-id").text()),
              parseInt($(this).find("target-id").text()),
              $(this).find("directed:first").text() == "true"
            );
          }); 
      });

      /* Must process these as well. expandWorld calls this multiple times. */
      if (thisgraph.scaleChanged != null)
        thisgraph.scaleChanged();
    },
    error: function(a,b,c){
      //alert("Cannot load notes: "+a+" "+b+" "+c);
    }
  });
}

/* Finds note by name. This call is synchronous. */
Sync.prototype.findNoteByName = function(name){
  var thisgraph = this.graph;
  var tmp = null;
  
  $.ajax({
    url: "/graphs/get_notes_by_name/" + thisgraph.id,
    type: "POST",
    data: {
      "name" : name
    },
    async: false,
    dataType: "xml",
    success: function(data){
      $("note", data).each(function(i) {
      tmp = new Note(thisgraph);
          tmp.x = parseInt($(this).find("x:first").text());
          tmp.y = parseInt($(this).find("y:first").text());
          tmp.width = parseInt($(this).find("width:first").text());  
          tmp.height = parseInt($(this).find("height:first").text());
      });
    },
    error: function(a,b,c){
      alert(a + b + c);
    }
  });
  return tmp;
}

/****************************************************************************
  Inform the server about a NEW EDGE.
  Gives the edge a server assigned id number.
 ****************************************************************************/

Sync.prototype.createEdge = function(edge){
  var t = this;
  var e = edge;
  $.ajax({
    url: "/edges/create",
    type: "POST",
    data: {
      "edge[name]" : e.title,            
      "edge[color]" : e.color,           
      "edge[source_id]" : e.startNote.id,
      "edge[target_id]" : e.endNote.id,
      "edge[directed]" : e.directed, "clientId" : t.uniqueId
    },
    dataType: "xml",
    success: function(data){
      $("edge", data).each(function(i) {
        e.id = parseInt($(this).find("id:first").text());
      });
    },
    error: function(a,b,c){
      alert("Cannot create a new edge: "+a+b+c);
    }
  });
}

/****************************************************************************
  Inform the server about a EDGE DELETION.
 ****************************************************************************/

Sync.prototype.deleteEdge = function(edgeId){
  $.ajax({ url: "/edges/destroy/"+edgeId });
}


/****************************************************************************
  Inform the server about a EDGE NAME change.
 ****************************************************************************/

Sync.prototype.setEdgeName = function(edge, newName){
  var t = this;
  var e = edge;
  $.ajax({
    url: "/edges/update/"+e.id,
    dataType: "html",
    data: { "edge[name]" : newName, "clientId" : t.uniqueId },
    success: function(data){
      e.name=newName;
      e.redraw();
    }
  });
}

/****************************************************************************
  Inform the server about a EDGE COLOR change.
 ****************************************************************************/

Sync.prototype.setEdgeColor = function(edge){
  var t = this;
  $.ajax({
    url: "/edges/update/"+edge.id,
    data: { "edge[color]" : edge.color, "clientId" : t.uniqueId },
    dataType: "html"
  });
}

/****************************************************************************
  Inform the server about a EDGE DIRECTION change.
 ****************************************************************************/

Sync.prototype.setEdgeDirection = function(edge){
  var t = this;
  $.ajax({
    url: "/edges/update/"+edge.id,
    data: { "edge[directed]" : edge.directed, "clientId" : t.uniqueId },
    dataType: "html"
  });
}

/****************************************************************************
  Generate a unique identification for the client.
 ****************************************************************************/

Sync.prototype.generateUniqueId = function(){
  var d = new Date;
  var uid = d.getTime()+Math.floor(1000000*Math.random());
  return uid;
}
