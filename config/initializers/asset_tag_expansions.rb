# The MIT License
# 
# Copyright (c) 2009 Sami Blommendahl, Mika Hannula, Ville Kivelä,
# Aapo Laitinen, Matias Muhonen, Anssi Männistö, Samu Ollila, Jukka Peltomäki,
# Matias Piipari, Lauri Renko, Aapo Tahkola, and Juhani Tamminen.
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
# 
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
