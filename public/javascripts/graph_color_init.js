// Loads the color picker for the new and edit forms of graphs.

$(document).ready(function() {

  // default color
  if($("#graph_color").val() == "")
    $("#graph_color").val("#dddddd"); 

  $("#picker").ColorPicker({
    flat: true, // what?
    color: $("#graph_color").val(),
    onChange: function(hsb, hex, rgb){
      $("#graph_color").val("#"+hex);
      $("#graph_color").css("backgroundColor", "#"+hex);
    }
  });

/* Old Farbtastic code
  // Default color for empty pickers (DOES NOT WORK PROPERLY WITHOUT)
  if($("#graph_color").val() == "")
    $("#graph_color").val("#dddddd"); 

  $("#picker").farbtastic("#graph_color"); // launch picker
*/
});
