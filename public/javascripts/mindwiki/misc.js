// Miscellaneous functions

// calculates the euclidean distance between points (x1,y1) and (x2,y2).
function distance(x1,y1,x2,y2)
{
  var dx = x2 - x1;
  var dy = y2 - y1;
  return Math.sqrt(dx*dx + dy*dy);
}
 

function getAngle(x1, y1, x2, y2)
{
  // returns the angle (0 <= angle < 2*pi) from point (x1,y1) to (x2,y2).
  // assumes standrad coordinate system
        
  // let's handle main axis first
  if (x2 == x1)
  {
    if (y1 < y2)
    {
      return Math.PI / 2;
    }
    return 1.5 * Math.PI;
  }
  else if (y2 == y1)
  {
    if (x1 > x2)
    {
      return Math.PI;
    }
    return 0;
  }

  if (x1 > x2)
  {
    return Math.PI + Math.atan((y2-y1)/(x2-x1));
  }
  
  if (y1 > y2)
  {
    return 2 * Math.PI + Math.atan((y2-y1)/(x2-x1));
  }
  return Math.atan((y2-y1)/(x2-x1));
}

// returns the intersection point of a given rectangle and a line, which starts
// from the center point of the rectangle and goes to ang direction.
function rectangleIntersection(cx,cy,width,height,ang,result)
{
  // assumes standard coordinate system!

  var aLimit = Math.atan(height/width);
  // padding is added to make edges start and stop a few pixels before notes.
  var padding = 2;

  if (ang <= aLimit || ang >= 2 * Math.PI - aLimit)
  {
    result[0] = cx + width/2 + 3*padding;
    result[1] = cy + Math.tan(ang) * width / 2;
  }
  else if (ang > aLimit && ang < Math.PI - aLimit)
  {
    // note: sin(a) > 0. no need to check division by zero.
    result[0] = cx + (Math.cos(ang) / Math.sin(ang)) * height / 2
    result[1] = cy + height / 2;
  }
  else if (ang >= Math.PI - aLimit && ang <= Math.PI + aLimit)
  {
    result[0] = cx - width/2;
    result[1] = cy - Math.tan(ang) * width / 2;
  }
  else if (ang > Math.PI + aLimit && ang < 2 * Math.PI - aLimit)
  {
    // note: sin(a) < 0. no need to check division by zero.
    result[0] = cx - (Math.cos(ang) / Math.sin(ang)) * height / 2
    result[1] = cy - height / 2 - 3*padding;
  }
}

function deColorize (color, factor) {
  tr = 128;
  tg = 128;
  tb = 128;
  
  color = color.substring(1,7);
  color = parseInt(color, 16);
  r = (color >> 16) & 255;
  g = (color >> 8) & 255;
  b = (color >> 0) & 255;
  
  r += (tr - r) * factor;
  g += (tg - g) * factor;
  b += (tb - b) * factor;
  
  color = (r << 16) | (g << 8) | b;
  color = color.toString(16);
  while(color.length < 6)
  	color = "0" + color;
  return "#" + color;
}

function lightenColor (color) {
  mult = 1.3;
  color = color.substring(1,7);
  color = parseInt(color, 16);
  r = (color >> 16) & 255;
  g = (color >> 8) & 255;
  b = (color >> 0) & 255;
  
  maxx = 0;
  maxx = r * mult > maxx ? maxx = r * mult : maxx;
  maxx = g * mult > maxx ? maxx = g * mult : maxx;
  maxx = b * mult > maxx ? maxx = b * mult : maxx;
  if (maxx > 255)
    mult = 1 - (mult - 1);
  r *= mult;
  g *= mult;
  b *= mult;
  if (mult < 1.0) {
    r = r < 0 ? 0 : r;
    g = g < 0 ? 0 : g;
    b = b < 0 ? 0 : b;
  }
  /*
  r = r > 255 ? 255 : r;
  g = g > 255 ? 255 : g;
  b = b > 255 ? 255 : b;*/
  
  color = (r << 16) | (g << 8) | b;
  color = color.toString(16);
  while(color.length < 6)
  	color = "0" + color;
  return "#" + color;
}

// converts radians to degrees
function radToDeg(rad) {
  return (rad / Math.PI) * 180.0;
}
