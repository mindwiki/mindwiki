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

