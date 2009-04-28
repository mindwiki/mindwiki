/*

The MIT License

Copyright (c) 2009 Sami Blommendahl, Mika Hannula, Ville Kivelä,
Aapo Laitinen, Matias Muhonen, Anssi Männistö, Samu Ollila, Jukka Peltomäki,
Matias Piipari, Lauri Renko, Aapo Tahkola, and Juhani Tamminen.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

// This file defines the MindWiki graph viewing and editing client

$(document).ready(function(){
  var graphs = /\/graphs\/\d+/; // regexp to identify pathnames that should have mindwiki graphs
  if(graphs.exec(document.location.pathname)){
    // Please note the sad global nature of these variables.
    /*graph =*/ new Graph();
  }
});

function Graph() {
  this.id = -1;
  this.selectedNote = null;
  this.selectedEdge = null;
  
  // Maybe more sophisticated containers?!
  this.notes = [];
  this.edges = [];

  this.extents = new Object();
  this.extents.min = new Object();
  this.extents.max = new Object();
  this.extents.mid = new Object();
  this.extents.min.x = 0;
  this.extents.min.y = 0;
  this.extents.max.x = 0;
  this.extents.max.y = 0;
  this.extents.mid.x = 0;
  this.extents.mid.y = 0;

  // Viewport is a small window into the world.
  this.world = document.createElement("div");
  $(this.world).attr("id","mindwiki_world");
  $("#vport").append(this.world);

  // Load graph ID from the path variable.
  // Is ID the only numerical data in the path? Currently, yeah. Maybe sharpen up the regexp, still.
  var id_from_pathname = new RegExp(/\d+/).exec(location.pathname);
  this.id = parseInt(id_from_pathname[0]); // RegExp.exec puts matches into an array

  this.rc = Raphael("mindwiki_world", 9999, 9999); // Raphael canvas, FIXME: static size
  this.color = "#dddddd";
  this.globalStartNote = null; // Used when creating new edges
  this.runningZ = 10; // Used for z-index = "top" within the context of notes
  $(".mindwiki_viewport").css({"overflow": "hidden"});


  this.viewportInit();
  this.syncInit();
  
  var newNoteName = this.vp.initFromURL();

  this.ghostEdgeInit();
  this.sync.initGraph();
  this.uiInit();
  this.contextHelpInit();

  /* Set zoom clipping it if necessary. */
  this.vp.callerScale = this.setZoomSlider(this.vp.callerScale * 20) / 20;

  this.configInit(false); // set to true to show config

  // Initialize the server updating timer
  checkServerForUpdates(this.sync);

  /* Create new note if requested. Hopefully all the init is completed. */
  if (newNoteName != null)
    this.createNoteAt(newNoteName, this.vp.x, this.vp.y);
} // end constructor

Graph.prototype.ghostEdgeInit = function() {
  // these are used to display the ghost edge when creating new edges
  this.drawGhost = false;
  this.ghostEdge = new Edge(this);
  this.ghostNote = new Note(this);
  this.ghostNote.width = 100;
  this.ghostNote.height = 100;
  this.ghostEdge.setEndNote(this.ghostNote);
  this.ghostEdge.setTitle("New edge");
  this.ghostEdge.setColor("#aaaaaa");
  this.ghostEdge.ghost = true;
}

Graph.prototype.viewportInit = function() {
  var graph = this;

  /* Init viewport. */
  this.vp = new Viewport();
  this.vp.graph = this;
  this.vp.minX = this.vp.maxX = this.extents.mid.x;
  this.vp.minY = this.vp.maxY = this.extents.mid.y;
  
  /* Initialization is not complete enough to call setViewSize. */
  this.vp.viewW = $("#vport").width();
  this.vp.viewH = $("#vport").height();
  //this.vp.setViewSize($("#vport").width(), $("#vport").height());
  
  $(window).resize(function() {
    graph.vp.setViewSize($("#vport").width(), $("#vport").height());
  });
}

Graph.prototype.contextHelpInit = function() {
  var graph = this;

  this.ch = new ContextHelp();

  $("#mindwiki_world").mouseover( function(){
    graph.ch.set("Create new notes by double clicking the background.");
    // The final event, no need to stop propagation
  });

  $(".note").livequery("mouseover", function(e){
    graph.ch.set("<strong>Edit content</strong> by double clicking the content area.");
    e.stopPropagation();
  });

  $(this.arrowButton.div).mouseover(function(e)
  {
    graph.ch.set("<strong>Create a connection</strong> by clicking the arrow button of the first note, and then clicking the second note.");
    e.stopPropagation();
  }
  );

  $(this.colorButton.div).mouseover(function(e)
  {
    graph.ch.set("<strong>Change color.</strong>");
    e.stopPropagation();
  }
  );
  
  $(this.deleteButton).mouseover(function(e)
  {
    graph.ch.set("<strong>Delete note.</strong>");
    e.stopPropagation();
  }
  );

  /* Edges. */
  $(this.edgeTextButton).mouseover(function(e)
  {
    graph.ch.set("<strong>Edit text.</strong>");
    e.stopPropagation();
  }
  );

  $(this.edgeColorButton).mouseover(function(e)
  {
    graph.ch.set("<strong>Edit color.</strong>");
    e.stopPropagation();
  }
  );

  $(this.edgeDirectionButton.div).mouseover(function(e)
  {
    graph.ch.set("<strong>Make directed/undirected.</strong>");
    e.stopPropagation();
  }
  );

  $(this.edgeDeleteButton.div).mouseover(function(e)
  {
    graph.ch.set("<strong>Delete connection.</strong>");
    e.stopPropagation();
  }
  );
}

Graph.prototype.syncInit = function() {
  var graph = this;

  // Creating and attaching the server-syncer
  this.sync = new Sync(this);
  var thissync = this.sync;

  /* Initialize sync error handler. */
  this.sync.noteSyncFailure = function(note) {
    var helperText = document.createElement("div");
    $(helperText).html("Failed to update note " + note.syncFailureReason + " on server.");

    note.syncRetryConfig = new Config();
    note.syncRetryConfig.newOption("button", "Try again", function() {
      thissync.tryNoteSync(note);
    });

    helperText.appendChild(note.syncRetryConfig.getHandle());
    note.syncError(helperText);
  }
  
  this.sync.noteSyncFailureResolved = function(note) {
    note.syncError(null);
  }
}

Graph.prototype.zoomInit = function() {
  var graph = this;

  /* Updated slider position returning new value it was clipped to. */
  this.setZoomSlider = function(newVal) {
    if (newVal < $(this.zoomScrollbar).slider('option', 'min'))
      newVal = $(this.zoomScrollbar).slider('option', 'min');

    if (newVal > $(this.zoomScrollbar).slider('option', 'max'))
      newVal = $(this.zoomScrollbar).slider('option', 'max');

    $(this.zoomScrollbar).slider('option', 'value', newVal);
    
    return newVal;
  }
  
  $("#mindwiki_world").mousewheel( function(event, delta) {
    var x = event.pageX - $(this).offset().left;
    var y = event.pageY - $(this).offset().top;
    var newVal = graph.setZoomSlider($(graph.zoomScrollbar).slider('option', 'value') + delta);

    /* jQuery does not call slider callback. */
    graph.vp.scaleByOrigin(x, y, newVal/20.0);
    graph.vp.updateURL();
    
    event.stopPropagation();
  });

  /* Zoom scrollbar */
  this.zoomScrollbar = document.createElement("div");
  $(this.zoomScrollbar).addClass("zoomScrollbar");

  $(this.zoomScrollbar).slider({
    min: 0,
    max: 20,
    value: 20,
    slide: function(ev, ui) {
      graph.vp.setScale(ui.value/20.0);
      graph.vp.updateURL();
    }
  });
  
  $("#vport").append(this.zoomScrollbar);

}

Graph.prototype.navigatorInit = function() {
  var graph = this;

  /* "Navigator" */
  this.viewAdd = function(x, y) {
   /* Always move by same amount regardless of zoom level, hence the scaleToWorld. */
    graph.vp.setView(graph.vp.viewX() + graph.vp.scaleToWorld(x),
                     graph.vp.viewY() + graph.vp.scaleToWorld(y));
    /*graph.vp.setViewFastMove(graph.vp.viewX() + x, graph.vp.viewY() + y);*/
    graph.vp.updateURL();
  };
  
  this.navigatorDiv = document.createElement("div");
  this.navigatorLeft = document.createElement("div");
  this.navigatorRight = document.createElement("div");
  this.navigatorUp = document.createElement("div");
  this.navigatorDown = document.createElement("div");

  $(this.navigatorDiv).addClass("navigator");

  $(this.navigatorLeft).addClass("navigatorLeft");
  $(this.navigatorLeft).click(function (e) { graph.viewAdd(-150, 0); e.stopPropagation(); });
  /* TODO: find better way of doing this. Some selector perhaps? */
  $(this.navigatorLeft).dblclick(function (e) { e.stopPropagation(); });
  $(this.navigatorDiv).append(this.navigatorLeft);

  $(this.navigatorRight).addClass("navigatorRight");
  $(this.navigatorRight).click(function (e) { graph.viewAdd(150, 0); e.stopPropagation(); });
  $(this.navigatorRight).dblclick(function (e) { e.stopPropagation(); });
  $(this.navigatorDiv).append(this.navigatorRight);

  $(this.navigatorUp).addClass("navigatorUp");
  $(this.navigatorUp).click(function (e) { graph.viewAdd(0, -150); e.stopPropagation(); });
  $(this.navigatorUp).dblclick(function (e) { e.stopPropagation(); });
  $(this.navigatorDiv).append(this.navigatorUp);

  $(this.navigatorDown).addClass("navigatorDown");
  $(this.navigatorDown).click(function (e) { graph.viewAdd(0, 150); e.stopPropagation(); });
  $(this.navigatorDown).dblclick(function (e) { e.stopPropagation(); });
  $(this.navigatorDiv).append(this.navigatorDown);
  
  $("#mindwiki_world").append(this.navigatorDiv);
}

Graph.prototype.noteControlsInit = function() {
  var graph = this;

 // Initialize controls 
  this.buttonsDiv = document.createElement("div");
  
  // Buttons

  // arrow button
  this.arrowButton = new ToggleButton("noteArrowButton", function(value) {
    if (value == true)
      graph.beginEdgeCreation();
    else
      graph.endEdgeCreation();
  });
  $(this.buttonsDiv).append(this.arrowButton.div);

  // color button
  this.colorButton = new ToggleButton("noteColorButton", function(value) {
    if (value == true)
      $(graph.colorButton.div).ColorPicker("show");
    else
      $(graph.colorButton.div).ColorPicker("hide");
  });
  $(this.buttonsDiv).append(this.colorButton.div);

   
  // text button  
  this.noteTextButton = document.createElement("div");
  $(this.noteTextButton).addClass("noteTextButton");
  $(this.buttonsDiv).append(this.noteTextButton);

  // delete button
  this.deleteButton = document.createElement("div");
  $(this.deleteButton).addClass("noteDeleteButton");
  $(this.buttonsDiv).append(this.deleteButton);
  
  $(this.buttonsDiv).addClass("noteButton").hide();

  $(this.deleteButton).mousedown(function () {
    $(graph.deleteButton).removeClass().addClass("noteDeleteButtonPressed");
  });
  $(this.deleteButton).mouseout(function () {
    $(graph.deleteButton).removeClass().addClass("noteDeleteButton");
  });

  /* Controls */
  $(this.colorButton.div).ColorPicker({
    onBeforeShow: function () {
      /* Need to fetch it. */
      $(this).ColorPickerSetColor(graph.selectedNote.color);
    },
    onShow: function(picker){
      $(picker).fadeIn(100);
      return false;
    },
    onHide: function(picker){
      /* Reset button state. */
      graph.colorButton.setState(false); 
      graph.sync.setNoteColor(graph.selectedNote, graph.selectedNote.color);
      $(picker).fadeOut(100);
      return false;
    },
    onChange: function (hsb, hex, rgb) {
      graph.selectedNote.color = "#"+hex;
      graph.selectedNote.update();
    },
    onSubmit: function(){
      /* Reset button state. */
      graph.colorButton.setState(false); 
      $(".colorpicker").css('display', 'none'); 
      graph.sync.setNoteColor(graph.selectedNote, graph.selectedNote.color);
    }
  });
  
  $(this.noteTextButton).click(function (event) {
   	
	// This code might be a bit flakey, still. Using the same textbox-id for all notes absolutely requires
    // the calling of dialog("destroy").remove() to not cause some really annoyingly strange behaviour..
    // Maybe FIX someday?

    var currentNote = graph.selectedNote;
    $("#mindwiki_world").append('<div id="editWindow" class="flora"></div>');
    $("#editWindow").append('<p>Title<br /><input type="text" size="30" id="titleInputField" value="'+currentNote.name+'"/></p><p>Content<br /><textarea rows="15" cols="75" id="editableContentBox">'+currentNote.editableContent+'</textarea></p>');
    $("#editableContentBox").markItUp(mySettings);
    $("#editWindow").css({"zIndex": "2100000001", "overflow": "auto"}); // isn't there a 'top' option? :)
    $("#editWindow").dialog({
      width: 750,
      height: 550,
      modal: true,
      title: graph.selectedNote.name+" (Editing)",
      buttons: {
        "Cancel": function(){
          $(this).dialog("destroy").remove();
        },
        "Save": function(){

          // Updating the title
          var newTitle = $("#titleInputField").val();
          if(currentNote.name != newTitle){
            graph.sync.setNoteName(currentNote, newTitle);
          }
           // Updating the content
          var boxContents = $("#editableContentBox").val();
          currentNote.editableContent = boxContents;
          currentNote.content = "Rendering edited content, please wait...";
          graph.sync.setNoteContent(currentNote, boxContents);
          $(this).dialog("destroy").remove(); // Don't edit lightly :)
        }
      }
    });
  });
 
  $(this.deleteButton).click(function () {
    if (graph.selectedNote != null)
    {
      graph.selectedNote.remove();
      graph.selectedNote = null; /* some strange behaviour without this... */
    }
  });

  //$("#vport").append(this.buttonsDiv);
  $("#mindwiki_world").append(this.buttonsDiv);
}

Graph.prototype.edgeControlsInit = function() {
  var graph = this;
  /////////////////////////////////////////////////////////////////
  //
  // EDGE BUTTONS & CONTROLS
  //
  /////////////////////////////////////////////////////////////////
  
  this.edgeTextDiv = document.createElement("div");
  $(this.edgeTextDiv).editable(function(value, settings) {
      graph.selectedEdge.setTitle(value);
      graph.selectedEdge.redraw();
      graph.sync.setEdgeName(graph.selectedEdge, value);  
      graph.unselectEdge();
      $(this).hide();
      return(value);
    }, 
    { 
      type: "text",
      event: "click",
      cssclass : "noteTitleEdit"
  }).click(function (event) {
      event.stopPropagation();
  }).addClass("edgeTitle").hide();
  
  $("#mindwiki_world").append(this.edgeTextDiv);


  this.edgeButtonsDiv = document.createElement("div");

  this.edgeTextButton = document.createElement("div");
  $(this.edgeTextButton).addClass("edgeTextButton");
  $(this.edgeButtonsDiv).append(this.edgeTextButton);

  this.edgeColorButton = document.createElement("div");
  $(this.edgeColorButton).addClass("edgeColorButton");
  $(this.edgeButtonsDiv).append(this.edgeColorButton);

  this.edgeDirectionButton = new ToggleButton("edgeDirectionButton", function(value) {
    graph.setEdgeDirected(value == false);
  });
  $(this.edgeButtonsDiv).append(this.edgeDirectionButton.div);

  this.edgeDeleteButton = document.createElement("div");
  $(this.edgeDeleteButton).addClass("edgeDeleteButton");
  $(this.edgeButtonsDiv).append(this.edgeDeleteButton);

  $(this.edgeButtonsDiv).addClass("noteButton").hide();

  $(this.edgeTextButton).click(function (event) {
    if (graph.selectedEdge != null)
    {
      var top = $(graph.edgeButtonsDiv).css("top");
      var left = $(graph.edgeButtonsDiv).css("left");
      var currentEdge = graph.selectedEdge;
      $(graph.edgeTextDiv).css({
        "top" : top,
        "left" : left
      }).html(graph.selectedEdge.title).show().click(); // click opens the edit mode
      $(graph.edgeButtonsDiv).hide();
      event.stopPropagation();
    }
  });

  $(this.edgeColorButton).ColorPicker(
  {
    onBeforeShow: function () {
      /* Need to fetch it. */
      $(this).ColorPickerSetColor(graph.selectedEdge.color);
    },
    onShow: function(picker){
      $(picker).fadeIn(100);
      return false;
    },
    onHide: function(picker){
      /* Color changes automatically, but if the user didn't click close we still need
         to save the color to the database. */
      if (graph.selectedEdge != null)
      {
        graph.sync.setEdgeColor(graph.selectedEdge);
      }
      $(picker).fadeOut(100);
      return false;
    },
    onChange: function (hsb, hex, rgb) {
      graph.selectedEdge.setColor("#"+hex);
    },
    onSubmit: function(){
      $(".colorpicker").css('display', 'none');  
      graph.sync.setEdgeColor(graph.selectedEdge);
      graph.unselectEdge();
    }
  });

  $(this.edgeDeleteButton).click(function () {
    if (graph.selectedEdge != null)
    {
      graph.selectedEdge.remove();
      graph.selectedEdge = null;
    }
  });
  
  $("#mindwiki_world").append(this.edgeButtonsDiv);

}

Graph.prototype.worldInit = function() {
  var graph = this;

  // NEW NOTE creation by double clicking in the viewport
  $("#mindwiki_world").dblclick( function(event){
    graph.createNoteAt(null,
                       graph.vp.toWorldX(event.pageX - $(this).offset().left),
                       graph.vp.toWorldY(event.pageY - $(this).offset().top));
  });
		
  this.downX = -1; /* Set to -1 when no drag is in progress. */
  this.cursorChanged = false;
  $("#mindwiki_world").mousedown(function (event) {
    graph.downX = event.pageX;
    graph.downY = event.pageY;
    graph.cursorChanged = false;
  });
  
  $("#mindwiki_world").mousemove(function (event) {

    // ghost
    if (graph.drawGhost) {
      graph.ghostNote.x = graph.vp.toWorldX(event.pageX - $(this).offset().left);
      graph.ghostNote.y = graph.vp.toWorldY(event.pageY - $(this).offset().top);
      graph.ghostEdge.redraw();
      return;
    }

    if (graph.downX == -1)
      return;
      
    if (graph.cursorChanged == false) {
      $("#mindwiki_world").css({"cursor": "move"});
      graph.cursorChanged = true;
    }
    var x = event.pageX - graph.downX;
    var y = event.pageY - graph.downY;
    
    /* Reverse direction and scale to world. */
    graph.vp.addViewFastMove(graph.vp.scaleToWorld(-x), graph.vp.scaleToWorld(-y));
    
    graph.downX = event.pageX;
    graph.downY = event.pageY;
  });
  
  $("#mindwiki_world").mouseup(function (event) {
    /* "Workaround". */
    graph.vp.setView(graph.vp.viewX(), graph.vp.viewY());

    $("#mindwiki_world").css({"cursor": "default"});
    graph.downX = -1;
    graph.vp.updateURL();
  });

  $("#mindwiki_world").click( function(event){
    var x = event.pageX - $(this).offset().left;
    var y = event.pageY - $(this).offset().top;
    
    var margin = 10;

    /* edges are in local coordinates. */
    graph.edgeClick(x,y,margin);
    
    // if clicked empty space, note is unselected.
    if (graph.selectedNote != null)
    {
      graph.selectedNote.deselect();
      /* detachControls should be called in deselect but that seems little wasteful since
         in most cases we would be selecting another note. */
      graph.detachControls(graph.selectedNote);
      graph.selectedNote = null;
    }
    graph.endEdgeCreation();
    // hide edge text edit. just in case it's visible.
    $(".edgeTitle").hide();
  });
}

Graph.prototype.noteInit = function() {
  var graph = this;

  $(".note").livequery("click", function(event){
    // note's click event is handled in the note class, but this is
    // needed here to prevent click event to bubble to background.
    event.stopPropagation();
  });
		
  $(".note").livequery("dblclick", function(event){
    // this event should never fire...
    event.stopPropagation();
  });
		
  $(".noteTitle").livequery("dblclick", function(event){
    // this event is not used. we just prevent the dblclick
    // to bubble to parents.
    event.stopPropagation();
  });

  // Stop events in class stop_propagation
  // Used for youtube-videos, for instance..
  $(".stop_propagation").livequery("mousedown", function(e){
    e.stopPropagation();
  });

  /* Booby trap internal links. Slightly hackish.. */
  $(".internal_link").livequery("click", function(event){
    jQuery.url.setUrl(event.target);
    
    var newNoteName = graph.vp.initFromURL();
    graph.vp.setView(graph.vp.x, graph.vp.y);

    if (newNoteName != null)
      graph.createNoteAt(newNoteName, graph.vp.x, graph.vp.y);

    // note's click event is handled in the note class, but this is
    // needed here to prevent click event to bubble to background.
    event.stopPropagation();
  });
}

Graph.prototype.uiInit = function() {
  var graph = this;
  
  this.worldInit();
  this.noteInit();
  this.zoomInit();
  this.navigatorInit();
  this.noteControlsInit();
  this.edgeControlsInit();
}

Graph.prototype.configInit = function(show) {
  var graph = this;

  this.mMove = true;
  this.scrollToSelected = true;
  this.controlsAfterDrag = false;
  this.asyncAjax = true;
  this.debug = false;

  if (show) {
    this.config = new Config();
    $(this.config.getHandle()).addClass("config");
    //this.config.newOption("text", "example", function(value) { alert("text is " + value); });
    //this.config.newOption("button", "setView", function() { graph.vp.setView(graph.vp.x, graph.vp.y); });

    this.config.newOption("checkbox", "mMove", function(value) { graph.mMove = value; });
    this.config.newOption("checkbox", "scrollToSelected", function(value) { graph.scrollToSelected = value; });
    this.config.newOption("checkbox", "controlsAfterDrag", function(value) { graph.controlsAfterDrag = value; });
    this.config.newOption("checkbox", "synchronousAjax", function(value) { graph.asyncAjax = (value == false); });
    this.config.newOption("checkbox", "debug", function(value) { graph.debug = value; });
    this.config.newOption("button", "Hide", function() { $(graph.config.div).hide("slow"); });

    $("#vport").append(this.config.getHandle());
  }
}

Graph.prototype.scaleChanged = function() {
  var s = Math.floor(this.vp.scaleToView(100));
  
  if (this.selectedNote != null)
    this.selectedNote.scaleChanged();
  
  if (s < 60)
    $(".noteArticle").hide();
  else
    $(".noteArticle").show();

  if (s < 50){
    $(".noteTitle").css({"font-size": "100%"});
    $(".noteTitle").addClass("noteTitleMaxed");
  } else {
    $(".noteTitle").css({"font-size": s + "%"});
    $(".noteTitle").removeClass("noteTitleMaxed");
  }
}


Graph.prototype.beginEdgeCreation = function()
{
  this.globalStartNote = this.selectedNote;
  this.ch.setPriorityText("<strong>Select target note</strong> or click on active note to cancel.", 1);
  this.selectedNote.disable();
  this.selectedNote.disableLinkedNotes();

  this.ghostNote.x = this.selectedNote.x;
  this.ghostNote.y = this.selectedNote.y;
  this.ghostEdge.setStartNote(this.selectedNote);
  this.ghostEdge.update();
  this.ghostEdge.draw();
  this.drawGhost = true;
}

Graph.prototype.endEdgeCreation = function()
{
  /* Restore toggle button. */
  this.arrowButton.setState(false);
  
  if (this.globalStartNote == null)
    return;
  
  /* Restore color. */
  this.globalStartNote.enable();
  this.globalStartNote.enableLinkedNotes();
  this.globalStartNote = null; // ready for a new edge to be created
  this.ch.resetPriority(0);
  this.ch.set("");
  
  this.drawGhost = false;
  this.ghostEdge.erase();
  this.ghostEdge.setStartNote(null);
}

Graph.prototype.createNoteAt = function(name, x, y)
{
    var tmp = new Note(this);
    
    if (name != null)
      tmp.name = name;
    
    tmp.x = x;
    tmp.y = y;
    
    /* Center */
    tmp.x -= tmp.width / 2;
    tmp.y -= tmp.height / 2;
    
    tmp.newID();
    tmp.createDiv();
    tmp.center(); // Center on create regardless of user preferences
    // Let's select the new note right away, too.
    this.notes.push(tmp);
    tmp.select();
    tmp.update();

    return tmp;
}

// Show the user that we are loading...
Graph.prototype.loading = function(isLoading){
  if(isLoading){
    $(".loadingDiv").show();
  } else {
    $(".loadingDiv").fadeOut(400);
  }
}

Graph.prototype.attachControls = function(thisnote){
  $(this.buttonsDiv).show(this.controlsAfterDrag ? "fast" : "");
  this.dragControls(thisnote);
}

Graph.prototype.dragControls = function(thisnote){
  $(this.buttonsDiv).css({
    "top" : (this.vp.toViewY(thisnote.y)-26) +"px", /* FIXME: -26 */
    "left" : this.vp.toViewX(thisnote.x)+"px",
    "width" : this.vp.scaleToView(thisnote.width) + "px"
  });
}

Graph.prototype.detachControls = function(thisnote){
  if (this.selectedNote == null || thisnote.id == this.selectedNote.id)
    $(this.buttonsDiv).hide(this.controlsAfterDrag ? "fast" : "");
}


Graph.prototype.attachControlsToEdge = function(x,y){
  /* Restore toggle button. */
  this.edgeDirectionButton.setState(this.selectedEdge.isDirected() == false);
  
  $(this.edgeButtonsDiv).show();
  $(this.edgeButtonsDiv).css({
    "top" : y-31 +"px",
    "left" : x-54 +"px"
  });
}

Graph.prototype.detachControlsFromEdge = function(){
  $(this.edgeButtonsDiv).hide();
}


Graph.prototype.getNoteById = function(id){
  var l = this.notes.length;
  for(var i=0;i<l;i++){
    if(this.notes[i].id == id)
      return this.notes[i];
  }
  return null;
}

Graph.prototype.getNoteCenterByName = function(name){
  var l = this.notes.length;
  var n = null;
  
  for(var i=0;i<l;i++)
    if(this.notes[i].name == name) {
      n = this.notes[i];
    }
  
  /* Search entire graph... */
  if (n == null)
   n = this.sync.findNoteByName(name);
 
  if (n != null)
    return {x: n.x + n.width / 2, y: n.y + n.height / 2};

  return null;
}

Graph.prototype.getEdgeById = function(id){
  var l = this.edges.length;
  for(var i=0;i<l;i++){
    if(this.edges[i].id == id)
      return this.edges[i];
  }
  return null;
}

// Updates edge. This is for tiled note loading.
// (When we load the edge for the first time, the second note may not be read yet)
Graph.prototype.updateEdge = function(id,title,color,sourceId, targetId, directed){
  var graph = this;
  var edge = null;

  // The edge already exists (second hit)
  if(graph.getEdgeById(id) != null){
    edge = graph.getEdgeById(id);

    edge.setTitle(title);
    edge.setColor(color);
    edge.setDirected(directed);

    // Is the edge already okay?
    if(edge.startNote != null && edge.endNote != null){
      //edge.redraw();
      // erase/draw instead, to update edge text properly
      edge.erase();
      edge.draw();
      //alert("edge "+edge.id+" redraw!");
      return;
    }

    if(!edge.startNote)
      edge.startNote = graph.getNoteById(sourceId);
    if(!edge.endNote)
      edge.endNote = graph.getNoteById(targetId);

    // References to this edge:
    // Startnote
    if(edge.startNote){
      if(!edge.startNote.getEdgeFromById(edge.id)) {
        edge.startNote.edgesFrom.push(edge);
      }
    }
    // Endnote
    if(edge.endNote){
      if(!edge.endNote.getEdgeToById(edge.id)) {
        edge.endNote.edgesTo.push(edge);
      }
    }
    // If we have both references, the edge can be drawn
    if(edge.startNote != null && edge.endNote != null){
      //alert(edge.directed+": "+directed);
      edge.update();
      edge.draw();
    }
    
  // New edge (first hit)
  } else {
    edge = new Edge(graph);
    edge.id = id;
    edge.title = title;
    edge.color = color;
    edge.setDirected(directed);
    // In new edge it is okay to just assign straight away, since the methods just return null on "not found"
    if(sourceId) edge.startNote = graph.getNoteById(sourceId);
    if(targetId) edge.endNote = graph.getNoteById(targetId);
    graph.edges.push(edge);
  }


}

// Helper function to remove objects from arrays (notes and edges).
Graph.prototype.removeFromArray = function(arr, objId)
{
  var l = arr.length;
  for (var i=0;i<l;i++)
  {
    if(arr[i].id == objId)
    {
      arr.splice(i,1);
      return;
    }
  }
}

Graph.prototype.addEdge = function(edge)
{
  this.edges.push(edge);
}

Graph.prototype.disconnectEdge = function(edgeId)
{
  this.removeFromArray(this.edges,edgeId);
}

Graph.prototype.disconnectNote = function(noteId)
{
  this.removeFromArray(this.notes,noteId);
}


Graph.prototype.edgeClick = function(x,y,margin)
{
    var l = this.edges.length;
    for (var i=0;i<l;i++) 
    {
      if (this.edges[i].isHit(x,y,margin))
      {
        this.selectEdge(this.edges[i],x,y);
        return;
      }
    }
    // if we missed all edges, then unselect possible selected edge.
    this.unselectEdge();
}    

Graph.prototype.selectEdge = function(edge,x,y)
{
  if (this.selectedEdge != null && this.selectedEdge != edge)
  {
    this.selectedEdge.unselect();
  }
  
  this.selectedEdge = edge;
  this.selectedEdge.select();
  
  this.attachControlsToEdge(x,y);
}    

Graph.prototype.unselectEdge = function()
{
  if (this.selectedEdge != null) 
  {
    this.selectedEdge.unselect();
    this.selectedEdge = null;
    this.detachControlsFromEdge();
  }
}

Graph.prototype.setEdgeDirected = function(value)
{
  if (this.selectedEdge != null) 
  {
    this.selectedEdge.setDirected(value);
    this.selectedEdge.redraw();
    this.sync.setEdgeDirection(this.selectedEdge);
  }
}

// converts (x,y) to local coordinates
Graph.prototype.localCoordinates = function(x,y,result)
{
  result[0] = x - $("#mindwiki_world").offset().left;
  result[1] = y - $("#mindwiki_world").offset().top;
}

Graph.prototype.UpdateAllNotesCSS = function() {
  for (var i = 0; i < this.notes.length; i++) {
    this.notes[i].updateCSS();
    
    for (var ii = 0; ii < this.notes[i].edgesTo.length; ii++)
      this.notes[i].edgesTo[ii].redraw();
  }
}

function ToggleButton(name, onChange) {
  this.div = document.createElement("div");
  this.state = false;
  this.onChange = onChange;
  this.name = name;
  
  var thisbutton = this;
  
  /* Use name as class and name + "Pressed" as pressed class. */
  $(this.div).addClass(name);
  
  /*
  // OS provided buttons perform the action when mouse button is released on top of button.
  // Getting it all work fine is slightly complicated so use click instead for now.
  $(this.div).mousedown(function (e) {
    //$(thisbutton.div).removeClass().addClass(name + "Pressed");
    //e.stopPropagation();
  });
  
  $(this.div).mouseup(function (e) {
    //thisbutton.setState(!thisbutton.pressed);
    //e.stopPropagation();
  });
  $(this.div).mouseout(function (e) {
    //thisbutton.setState(thisbutton.pressed);
    //e.stopPropagation();
  });
  */
  $(this.div).click(function (e) {
    thisbutton.setState(!thisbutton.state);
    e.stopPropagation();
  });
}

ToggleButton.prototype.setState = function(state) {
  if (state == this.state)
    return;
  
  this.state = state;
  this.onChange(this.state);

  if (this.state == true)
    $(this.div).removeClass().addClass(this.name + "Pressed");
  else
    $(this.div).removeClass().addClass(this.name);
}

