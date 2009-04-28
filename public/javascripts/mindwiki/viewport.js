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

/* 

  universe: entire graph in database
  world: part(bounding box) of universe that has been cached
  canvas: raphael canvas that user is looking at
  view: position of raphael canvas that user is looking at

  Universe and world use same coordinate system.
*/
function Viewport() {
    this.x = this.y = 0;
    this.scale = 1;
    this.callerScale = 1.0;
    this.canvasBoundry = 400; /* Same as reloadDistance really. */
}

/* Returns note name if "note=name" was specified but _not_ found in graph. */
Viewport.prototype.initFromURL = function() {
  var anchor = jQuery.url.attr("anchor");
  var note, pos;
  var vp = this;
  
  if (anchor == null)
    return ;
  
  /* Use url plugin to parse it. Cheap I know..*/
  anchor = "?" + anchor;
  
  this.x = this.y = Number.Nan;
  
  if ((note = jQuery.url.setUrl(anchor).param("note")) != null && 
      (pos = this.graph.getNoteCenterByName(note)) != null) {
    this.x = pos.x;
    this.y = pos.y;
    note = null;
  }
  
  if (isNaN(this.x) == true)
    this.x = parseInt(jQuery.url.setUrl(anchor).param("x"), 10);
  
  if (isNaN(this.y) == true)
    this.y = parseInt(jQuery.url.setUrl(anchor).param("y"), 10);
  
  this.callerScale = parseFloat(jQuery.url.setUrl(anchor).param("zoom"));
  
  /* These are not sane defaults but getting access to this.extents.mid. is not currently very easy. */
  if (isNaN(this.x) == true)
    this.x = 0;

  if (isNaN(this.y) == true)
    this.y = 0;

  if (isNaN(this.callerScale) == true)
    this.callerScale = 1.0;

  return note;
}

Viewport.prototype.updateURL = function() {
  window.location.href = "#x=" + this.x + "&y=" + this.y + "&zoom=" + this.callerScale;
}


Viewport.prototype.clipViewToUniverse = function(pos) {
  var newPos = pos;
  
  if (pos.x < this.graph.extents.min.x - this.scaleToWorld(this.viewW / 2))
    newPos.x = Math.floor(this.graph.extents.min.x - this.scaleToWorld(this.viewW / 2));

  if (pos.x > this.graph.extents.max.x + this.scaleToWorld(this.viewW / 2))
    newPos.x = Math.floor(this.graph.extents.max.x + this.scaleToWorld(this.viewW / 2));

  if (pos.y < this.graph.extents.min.y - this.scaleToWorld(this.viewH / 2))
    newPos.y = Math.floor(this.graph.extents.min.y - this.scaleToWorld(this.viewH / 2));

  if (pos.y > this.graph.extents.max.y + this.scaleToWorld(this.viewH / 2))
    newPos.y = Math.floor(this.graph.extents.max.y + this.scaleToWorld(this.viewH / 2));
  
  return newPos;
}

Viewport.prototype.addViewFastMove = function(x, y) {
  var newPos = this.clipViewToUniverse({x:this.x + x, y: this.y + y});
  x = newPos.x - this.x;
  y = newPos.y - this.y;

  /* Same as scaleToView but with floating point precision.*/
  this.canvasMoveX += x * this.scale;
  this.canvasMoveY += y * this.scale;
  
  /* Need to "reposition" canvas. */
  if (this.canvasMoveX < 0 || this.canvasMoveY < 0) {
    this.setView(x + this.x, y + this.y);
    return;
  }
  
  /* Need to "reposition" canvas. */
  if (this.canvasMoveX > this.canvasBoundry * 2 || this.canvasMoveY > this.canvasBoundry * 2) {
    this.setView(x + this.x, y + this.y);
    return;
  }
  
  this.x = this.x + x;
  this.y = this.y + y;

  $("#mindwiki_world").css('left', -this.canvasMoveX + "px");
  $("#mindwiki_world").css('top', -this.canvasMoveY + "px");

  if (this.graph.debug) {
    x1 = this.toViewX(this.x);
    y1 = this.toViewY(this.y);
    
    if (this.viewCanvasCircle == undefined) {
      this.viewCanvasCircle = this.graph.rc.circle(x1, y1, 10);
    }
    
    this.viewCanvasCircle.attr({cx: x1, cy: y1});
  }
  //this.graph.ch.setPriorityText("Canvas move " + this.canvasMoveX + " " + this.canvasMoveY, 10);
}

Viewport.prototype.setViewFastMove = function(x, y) {
}

Viewport.prototype.setViewSize = function(w, h) {
  this.viewW = w;
  this.viewH = h;
  this.setScale(this.callerScale); /* Calls setView as well. */
}

Viewport.prototype.setView = function(x, y) {
  var newPos = this.clipViewToUniverse({x:x, y:y});
  x = newPos.x;
  y = newPos.y;

  this.x = x;
  this.y = y;
  

  this.canvasX1 = x - this.scaleToWorld(this.viewW / 2 + this.canvasBoundry);
  this.canvasY1 = y - this.scaleToWorld(this.viewH / 2 + this.canvasBoundry);
  this.canvasX2 = x + this.scaleToWorld(this.viewW / 2 + this.canvasBoundry);
  this.canvasY2 = y + this.scaleToWorld(this.viewH / 2 + this.canvasBoundry);
  this.canvasMoveX = this.canvasBoundry;
  this.canvasMoveY = this.canvasBoundry;

  this.expandWorld(this.canvasX1, this.canvasY1, this.canvasX2, this.canvasY2);
  
  /* And scroll our canvas. */
  this.addViewFastMove(0, 0);
  
  this.graph.UpdateAllNotesCSS();
  if (this.graph.selectedNote != null)
    this.graph.dragControls(this.graph.selectedNote);
  //this.updateURL();

  if (this.graph.debug) {
    x1 = this.toViewX(this.x);
    y1 = this.toViewY(this.y);
    
    if (this.viewCircle == undefined) {
      this.viewCircle = this.graph.rc.circle(x1, y1, 5);
    }
    
    this.viewCircle.attr({cx: x1, cy: y1});
  }
}

Viewport.prototype.setViewX = function(x) {
  setView(x, this.y);
}

Viewport.prototype.setViewY = function(y) {
  setView(this.x, y);
}


Viewport.prototype.viewX = function() {
  return this.x;
}

Viewport.prototype.viewY = function() {
  return this.y;
}

Viewport.prototype.canvasLeft = function() {
  return this.canvasX1;
}

Viewport.prototype.canvasTop = function() {
  return this.canvasY1;
}

/* Both return floats. */
Viewport.prototype.toViewX = function(x) {
  var worldMid = (this.canvasX1 + this.canvasX2) / 2;
  var viewMid = this.viewW / 2 + this.canvasBoundry;

  return (x - worldMid) * this.scale + viewMid;
}

Viewport.prototype.toViewY = function(y) {
  var worldMid = (this.canvasY1 + this.canvasY2) / 2;
  var viewMid = this.viewH / 2 + this.canvasBoundry;

  return (y - worldMid) * this.scale + viewMid;
}

Viewport.prototype.toWorldX = function(x) {
  var viewMid = this.viewW / 2 + this.canvasBoundry;
  var worldMid = (this.canvasX1 + this.canvasX2) / 2;
  
  return Math.floor((x - viewMid) / this.scale + worldMid);
}

Viewport.prototype.toWorldY = function(y) {
  var viewMid = this.viewH / 2 + this.canvasBoundry;
  var worldMid = (this.canvasY1 + this.canvasY2) / 2;

  return Math.floor((y - viewMid) / this.scale + worldMid);
}

Viewport.prototype.setScaleInt = function(scale) {
  /* 1.0 zoomed in. 0.0 zoomed out. */
  var scalableX = this.graph.extents.max.x - this.graph.extents.min.x;
  var scalableY = this.graph.extents.max.y - this.graph.extents.min.y;

  /* Allow at least 1:4 scale. */
  if (scalableX < this.viewW * 4)
    scalableX = this.viewW * 4;

  if (scalableY < this.viewH * 4)
    scalableY = this.viewH * 4;
  
  /* Allow maximum 1:15 scale. */
  if (scalableX > this.viewW * 15)
    scalableX = this.viewW * 15;

  if (scalableY > this.viewH * 15)
    scalableY = this.viewH * 15;

  /* Uncomment to set hard limit on zoom.
     I.e. 1:15 regardless of graph size. */
  /*scalableX = this.viewW * 15;
  scalableY = this.viewH * 15;*/
    
  var x = this.viewW * scale + scalableX * (1 - scale);
  var y = this.viewH * scale + scalableY * (1 - scale);
  var xScale = this.viewW / x;
  var yScale = this.viewH / y;
  
  this.callerScale = scale;
  
  /* Take minimum. */
  this.scale = xScale < yScale ? xScale : yScale;
  
  if (this.graph.scaleChanged != null)
    this.graph.scaleChanged();
}

Viewport.prototype.setScale = function(scale) {
  this.setScaleInt(scale);
  this.setView(this.x, this.y);
}

Viewport.prototype.scaleToView = function(x) {
  return Math.floor(x * this.scale);
}

Viewport.prototype.scaleToWorld = function(x) {
  return Math.floor(x / this.scale);
}

Viewport.prototype.scaleByOrigin = function(x, y, scale) {
  /* This is a form of zoom where point (x, y) in view coords 
     projects to same world coords after scaling has been applied.
     In other words, translate (x, y) to world, scale and adjust to meet this condition.
  */
  var xMove = this.toWorldX(x) - this.x;
  var yMove = this.toWorldY(y) - this.y;

  this.setScaleInt(scale);

  var xMoveN = this.toWorldX(x) - this.x;
  var yMoveN = this.toWorldY(y) - this.y;

  var xOffset = xMove - xMoveN;
  var yOffset = yMove - yMoveN;
  
  this.setView(this.x + xOffset, this.y + yOffset);
}

Viewport.prototype.expandWorld = function(minX, minY, maxX, maxY) {
  /* Fetch new slices. */
  if (minX < this.minX) {
    this.graph.sync.getViewportNotes(minX, this.minY/**/, this.minX - minX, this.maxY - this.minY/**/);
    this.minX = minX;
  }

  if (minY < this.minY) {
    this.graph.sync.getViewportNotes(this.minX/**/, minY, this.maxX - this.minX/**/, this.minY - minY);
    this.minY = minY;
  }

  if (maxX > this.maxX) {
    this.graph.sync.getViewportNotes(this.maxX, this.minY/**/, maxX - this.maxX, this.maxY - this.minY/**/);
    this.maxX = maxX;
  }

  if (maxY > this.maxY) {
    this.graph.sync.getViewportNotes(this.minX/**/, this.maxY, this.maxX - this.minX/**/, maxY - this.maxY);
    this.maxY = maxY;
  }

  if (this.graph.debug) {
    /* Draw a crosshair with circles showing the extents.
       The raphael canvas is scrolled so it is fairly difficult to estimate where extents really are.
       Because of that, it is a good idea to set canvasBoundry to something like 10.
       If everything works as expected, circle should appear at the corner of the direction you are moving. */
    var x1, y1, x2, y2;
    x1 = this.toViewX(this.minX);
    y1 = this.toViewY(this.minY);
    x2 = this.toViewX(this.maxX);
    y2 = this.toViewY(this.maxY);
    
    if (this.extentsPath1 == undefined) {
      this.extentsPath1 = this.graph.rc.path({stroke: "#00ffff", "stroke-width": 2}).absolutely().moveTo(x1,y1).lineTo(x2,y2);
      this.extentsPath2 = this.graph.rc.path({stroke: "#00ffff", "stroke-width": 2}).absolutely().moveTo(x1,y2).lineTo(x2,y1);
      this.circle1 = this.graph.rc.circle(x1, y1, this.canvasBoundry*2);
      this.circle2 = this.graph.rc.circle(x1, y2, this.canvasBoundry*2);
      this.circle3 = this.graph.rc.circle(x2, y1, this.canvasBoundry*2);
      this.circle4 = this.graph.rc.circle(x2, y2, this.canvasBoundry*2);
    }
    
    this.extentsPath1.attr("path", "M " + x1 + " " + y1 + "L " + x2 + " " + y2);
    this.extentsPath2.attr("path", "M " + x1 + " " + y2 + "L " + x2 + " " + y1);
    this.circle1.attr({cx: x1, cy: y1});
    this.circle2.attr({cx: x1, cy: y2});
    this.circle3.attr({cx: x2, cy: y1});
    this.circle4.attr({cx: x2, cy: y2});
  }
}

Viewport.prototype.worldLeft = function() {
  return this.minX;
}

Viewport.prototype.worldTop = function() {
  return this.minY;
}

Viewport.prototype.worldRight = function() {
  return this.maxX;
}

Viewport.prototype.worldBottom = function() {
  return this.maxY;
}

Viewport.prototype.worldWidth = function() {
  return this.maxX - this.minX;
}

Viewport.prototype.worldHeight = function() {
  return this.maxY - this.minY;
}
