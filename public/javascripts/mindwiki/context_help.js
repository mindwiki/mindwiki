/*
 * Context help
 */

function ContextHelp() {
  this.priority = 0;
  this.timerCount = 0;
}


ContextHelp.prototype.set = function(text) {
  this.setPriorityText(text, 0);
}

/* In some cases, such as when we are creating new edges,
 * we want to discard less important help texts. Such texts should be set with
 * higher priority and resetPriority called afterwards to restore showing old less
 * important ones.
 */
ContextHelp.prototype.setPriorityText = function(text, p) {
  if (p < this.priority)
    return;
  
  this.priority = p;
  if (text == this.text)
    return;
  
  $("#context_help").empty().append(text);
  this.text = text;
}

ContextHelp.prototype.setPriorityTextTimeout = function(text, p, time) {
  var ch =  this;

  this.setPriorityText(text, p);

  setTimeout(function() {
    /* Multiple calls to setPriorityTextTimeout will set timers
       for each causing the message do disappear when first timer times out. 
       Sort this out by keeping a counter of active timers and ignoring others but the last one. */
    this.timerCount--;
    if (this.timerCount > 0)
      return;
    
    ch.resetPriority(0);
    ch.set(""); 
  }, time * 1000, ch);
  this.timerCount++;
}

ContextHelp.prototype.resetPriority = function(p) {
  this.priority = p;
}

