// This file contains the Edge "class"

// Constructor
function Edge (graph)
{
  this.graph = graph;
  this.id = -1;
  this.startNote = null;
  this.endNote = null;
  this.x1 = 0;
  this.y1 = 0;
  this.x2 = 0;
  this.y2 = 0;
  this.xLeft = 0;
  this.yLeft = 0;
  this.xRight = 0;
  this.yRight = 0;
  this.angle = 0; // direction from startnote to endnote in radians.
  this.textX = 0;
  this.textY = 0;
  this.textAngle = 0;
  this.color = "#000000";
  this.title = "";
  this.directed = true;
  this.selected = false;
  this.rCanvas = this.graph.rc;  // Raphael canvas
  this.canvasPath = null; // Raphael canvas.path
  this.canvasPath2 = null;
  this.text = null;  // Raphael text object
  this.canvasPathSelected = null; // draw this when selected
  this.circle = null;
  this.circle2 = null;
  this.arrowSize = 10;
  this.strokeWidth = 3;
  this.ghost = false;
}

Edge.prototype.remove = function() 
{
  var thisgraph = this.graph;
  var thisedge = this;
  this.erase();
  
  // Make sure controls are not visible on this one
  if (this.selected) 
  {
    thisgraph.detachControlsFromEdge(this);
  }
  
  this.startNote.disconnectEdgeFromById(this.id);
  this.endNote.disconnectEdgeToById(this.id);

  // Notify the thisgraph object
  thisgraph.disconnectEdge(this.id);
  // Notify the server
  thisgraph.sync.deleteEdge(this.id);

  // Delete the object
  delete thisedge;
}

Edge.prototype.setStartNote = function (note) 
{
  this.startNote = note;
}

Edge.prototype.setEndNote = function (note) 
{
  if (note == this.startNote) 
  {
    alert("Internal error 126623");
    // Does not exist: thisgraph.globalEndNote = null;
    this.startNote = null;
  }
  else 
    this.endNote = note;
}

Edge.prototype.setTitle = function (txt) 
{
  this.title = txt;
}

Edge.prototype.setColor = function (col) 
{
  this.color = col;

  if (this.canvasPath != null)
  {
    this.canvasPath.attr({stroke: this.color});
  }
  if (this.canvasPath2 != null)
  {
    this.canvasPath2.attr({stroke: this.color, fill: this.color});
  }
  if (this.circle != null)
  {
    this.circle.attr({stroke: this.color, fill: this.color});
  }
  if (this.text != null)
  {
    this.text.attr("fill", this.color);
  }
}

Edge.prototype.setDirected = function (value) 
{
  this.directed = value;
}

Edge.prototype.isDirected = function () 
{
  return this.directed;
}

// This updates edge position and angle based on values of the notes.
// Used before updating or drawing the edge with Raphael.
Edge.prototype.update = function()
{
  var thisgraph = this.graph;

  /* Caller should probably take care of this. */
  if (this.startNote == null || this.endNote == null)
  {
    thisgraph.ch.setPriorityText("Trying to draw an edge (id:"+this.id+"), which has a null note!", 1);
    return;
  }

  // Less writing if we assume edges are in local coords all the way.
  var sx = thisgraph.vp.toViewX(this.startNote.x) + thisgraph.vp.scaleToView(this.startNote.width / 2);
  var sy = thisgraph.vp.toViewY(this.startNote.y) + thisgraph.vp.scaleToView(this.startNote.height / 2);
  var ex = thisgraph.vp.toViewX(this.endNote.x) + thisgraph.vp.scaleToView(this.endNote.width / 2);
  var ey = thisgraph.vp.toViewY(this.endNote.y) + thisgraph.vp.scaleToView(this.endNote.height / 2);

  if (this.ghost)
  {
    ex = thisgraph.vp.toViewX(this.endNote.x);
    ey = thisgraph.vp.toViewY(this.endNote.y);
  }


  // viewport doesn't have standard coordinate system. that's why we count each y-coordinate
  // as negative to use standard 2D algebra.
  var negsy = -sy;
  var negey = -ey;
  var a = getAngle(sx, negsy, ex, negey);
  this.angle = a;
  
  var result = new Array();
  
  rectangleIntersection(sx, negsy, thisgraph.vp.scaleToView(this.startNote.width), thisgraph.vp.scaleToView(this.startNote.height), a, result);
  this.x1 = result[0];
  this.y1 = -result[1];

  // change direction. 
  a += Math.PI;
  if (a > 2 * Math.PI)
  {
    a -= 2 * Math.PI;
  }

  rectangleIntersection(ex, negey, thisgraph.vp.scaleToView(this.endNote.width), thisgraph.vp.scaleToView(this.endNote.height), a, result);
  this.x2 = result[0];
  this.y2 = -result[1];

  if (this.ghost)
  {
    this.x2 = ex;
    this.y2 = ey;
  }

  // Viewport doesn't have standard coordinate system. That is why we count each y-coordinate
  // as negative to use standard 2D algebra.
  var negy1 = -this.y1;
  var negy2 = -this.y2;
	
  // compute the other two points of the arrow tip
  var aLeft = this.angle - 0.85 * Math.PI;
  var aRight = this.angle + 0.85 * Math.PI;
  this.xLeft = this.x2 + this.arrowSize * Math.cos(aLeft);
  this.yLeft = -(negy2 + this.arrowSize * Math.sin(aLeft));
  this.xRight = this.x2 + this.arrowSize * Math.cos(aRight);
  this.yRight = -(negy2 + this.arrowSize * Math.sin(aRight));

  // calculate text position
  this.textAngle = -this.angle;
  var txtDx = (this.strokeWidth + 10) * Math.cos(Math.PI / 2 - this.textAngle);
  var txtDy = -(this.strokeWidth + 2) * Math.sin(Math.PI / 2 - this.textAngle);
  if (this.textAngle < -0.5 * Math.PI && this.textAngle > -1.5 * Math.PI)
  {
    this.textAngle -= Math.PI;
    txtDx = -txtDx;
    txtDy = -txtDy;
  }
  this.textX = txtDx + (this.x1 + this.x2) / 2;
  this.textY = txtDy + (this.y1 + this.y2) / 2;
  
  result = null;
}

Edge.prototype.redraw = function()
{
  /* Caller should probably take care of this. */
  if (this.startNote == null || this.endNote == null)
    return;
  
  this.update();

  var p1 = "M " + this.x1 + " " + this.y1 + "L " + this.x2 + " " + this.y2;
  if (this.canvasPathSelected != null)
  {
    this.canvasPathSelected.attr("path", p1);
  }
  this.canvasPath.attr("path", p1);

  if (!this.directed)
  {
    this.circle2.attr({cx: this.x2, cy: this.y2}).show();
    this.canvasPath2.hide();
  }
  else
  {
    this.circle2.hide();
    var p2 = "M " + this.x2 + " " + this.y2 + "L " + this.xLeft + " " + this.yLeft + "L " + this.xRight + " " + this.yRight;
    this.canvasPath2.attr("path", p2).show();
  }

  this.circle.attr({cx: this.x1, cy: this.y1});
  
  if (this.title.length > 0)
  {
    if (this.text != null)
    {
      this.text.attr("x", this.textX).attr("y", this.textY).rotate(radToDeg(this.textAngle), true);
    }
  }
}

// "Undraws" the edge.
Edge.prototype.erase = function()
{
  if (this.rCanvas == null)
  {
    alert("null canvas!");
  }
  
  if (this.selected)
  {
    this.canvasPathSelected.remove();
  }
  
  this.canvasPath.remove();
  this.canvasPath2.remove();
  this.circle.remove();
  this.circle2.remove();
  
  if (this.text != null)
  {
    this.text.remove();
  }
}

// Creates the drawing objects and displays them.
Edge.prototype.draw = function () 
{
  var thisgraph = this.graph;

  if (this.selected) 
  {
    this.canvasPathSelected = this.rCanvas.path({stroke: "#ffff00", "stroke-width": this.strokeWidth+4}).absolutely().moveTo(this.x1,this.y1).lineTo(this.x2,this.y2);
  }
  
  this.canvasPath = this.rCanvas.path({stroke: this.color, "stroke-width": this.strokeWidth}).absolutely().moveTo(this.x1,this.y1).lineTo(this.x2,this.y2);
  this.canvasPath2 = this.rCanvas.path({stroke: this.color, fill: this.color}).absolutely().moveTo(this.x2,this.y2).lineTo(this.xLeft,this.yLeft).lineTo(this.xRight,this.yRight).andClose();
  this.circle = this.rCanvas.circle(this.x1, this.y1, this.arrowSize / 2);
  this.circle.attr({stroke: this.color, fill: this.color});

  this.circle2 = this.rCanvas.circle(this.x2, this.y2, this.arrowSize / 2);
  this.circle2.attr({stroke: this.color, fill: this.color});

  if (this.directed)
  {
    this.circle2.hide();
  }
  else
  {
    this.canvasPath2.hide();
  }

  if (this.title.length > 0)
  {
    var thisEdge = this;
    this.text = this.rCanvas.text(this.textX, this.textY, this.title).attr({"font": '14px "Arial"'})
    .attr({"font-weight": "bold"}).attr("fill", this.color).rotate(radToDeg(this.textAngle));
    this.text.node.onclick = function(event) {
      var result = new Array();
      thisgraph.localCoordinates(event.pageX,event.pageY,result);
      thisgraph.selectEdge(thisEdge,result[0],result[1]);
      event.stopPropagation();
      result = null;
    };
  }
}

Edge.prototype.select = function () 
{
  if (!this.selected)
  {
    this.erase();
    this.selected = true;
    this.draw();
  }
}

Edge.prototype.unselect = function () 
{
  if (this.selected)
  {
    this.erase();
    this.selected = false;
    this.draw();
  }
}


// Checks if the given coordinates (x,y) are "close" to edge. The close means in
// this case that we draw a rectangle arourd the edge and then add the given margin
// to it. If (x,y) is inside the rectangle, then (x,y) is close to the edge.
Edge.prototype.isClose = function (x,y,margin) 
{
  // is x too far left from the edge
  if ((x+margin) < this.x1 && (x+margin) < this.x2)
  {
    return false;
  }
  // is x too far right from the edge
  if (x-margin > this.x1 && x-margin > this.x2)
  {
    return false;
  }
  // is y too far above the edge. note: raster oriented coordinates (origin at top left corner)
  if (y+margin < this.y1 && y+margin < this.y2)
  {
    return false;
  }
  // is y too far below the edge. note: raster oriented coordinates (origin at top left corner)
  if (y-margin > this.y1 && y-margin > this.y2)
  {
    return false;
  }
  // if we get here, then x,y is inside the rectangle
  return true;
}


Edge.prototype.isHit = function (x,y,margin) 
{
  // check first if we are even close
  if (!this.isClose(x,y,margin))
  {
    return false;
  }
  
  var edgeLength = distance(this.x1, this.y1, this.x2, this.y2);
  if (edgeLength < 1)
  {
    // the edge is actually a point.
    return true;
  }
  // algorithm from: http://local.wasp.uwa.edu.au/~pbourke/geometry/pointline/ (18.1.2009)
  var u = (x-this.x1)*(this.x2-this.x1) + (y-this.y1)*(this.y2-this.y1);
  u = u / (edgeLength*edgeLength); // note: edgeLength >= 1

  if (u < 0 || u > 1)
  {
    // closest point does not fall within the line segment
    return false;
  }
  
  var cx = this.x1 + u*(this.x2-this.x1);
  var cy = this.y1 + u*(this.y2-this.y1);
  
  if (distance(x,y,cx,cy) > margin)
  {
    return false;
  }
  
  return true;
}

// Sends a newly created edge to server, and gets a database id in return.
Edge.prototype.newID = function() 
{
  var thisgraph = this.graph;

  thisgraph.sync.createEdge(this);
}

