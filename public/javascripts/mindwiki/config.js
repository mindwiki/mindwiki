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
