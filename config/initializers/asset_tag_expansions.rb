# In dependency order (?)

# Javascript-files required by the MindWiki application (not all of the site, just the application)
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :mindwiki_graph => [
 "jquery-1.3.2", "jquery-ui-personalized-1.6rc6",
 "jquery.livequery", "jquery.url", "jquery.scrollTo", "jquery.jeditable", "jquery.mousewheel",
 "raphael", "colorpicker", "json2",
 "markitup/jquery.markitup", "markitup/jquery.jeditable.markitup.js", "markitup/sets/textile/set", 
 "mindwiki/misc", "mindwiki/context_help", "mindwiki/sync", "mindwiki/note", 
 "mindwiki/edge", "mindwiki/graph", "mindwiki/viewport", "mindwiki/config"]

ActionView::Helpers::AssetTagHelper.register_javascript_expansion :graph_color_picker => ["jquery-1.3.2", "colorpicker", "graph_color_init"]
 
# Stylesheet
ActionView::Helpers::AssetTagHelper.register_stylesheet_expansion :mindwiki_graph => [
 "ui.all",
 "/javascripts/markitup/skins/markitup/style",
 "/javascripts/markitup/sets/textile/style", "mindwiki_graph", "colorpicker"]

ActionView::Helpers::AssetTagHelper.register_stylesheet_expansion :graph_color_picker => ["colorpicker"]
