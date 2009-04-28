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

function Config() {
  this.options = [];
  this.div = document.createElement("div");
}

Config.prototype.getHandle = function() {
  return this.div;
}

/* TODO: write code to read/write initial values from/to db. */

Config.prototype.newOption = function(type, text, onChange) {
  if (type == "text")
    this.options.push(new ConfigText(text, onChange));
  else if (type == "checkbox")
    this.options.push(new ConfigCheckbox(text, onChange));
  else if (type == "button")
    this.options.push(new ConfigButton(text, onChange));
  else {
    alert("Unknown type " + type);
    return;
  }
  
  if (this.options[this.options.length - 1].div.type != "button")
    $(this.div).append("<a>" + text + "</>");
  $(this.div).append(this.options[this.options.length - 1].div);
}

function ConfigText(text, onChange) {
  this.div = document.createElement("input");
  this.div.type = "text";
  this.div.value = text;

  $(this.div).append(/*"value",*/ text);
  $(this.div).change(function(){ onChange($(this).val()); });
}

function ConfigCheckbox(text, onChange) {
  this.div = document.createElement("input");
  this.div.type = "checkbox";
  this.div.value = text;
  $(this.div).change(function() { onChange($(this).attr("checked")); });
}

function ConfigButton(text, onChange) {
  this.div = document.createElement("input");
  this.div.type = "button";
  this.div.value = text;
  $(this.div).click(function() { onChange(); });
}
