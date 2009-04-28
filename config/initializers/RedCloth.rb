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
require 'RedCloth'

# Youtube-tags, as in: [[youtube|nr0X46bgFY4]]
module RedClothYoutubeExtension
  def youtube(text)
    # Do youtube-video-codes only have [a-zA-Z0-9] and "-" "_"?
    text.gsub!(/\[\[(y|Y)(o|O)(u|U)(t|T)(u|U)(b|B)(e|E)\|([a-zA-Z0-9]|-|_)+\]\]/) do |tag|    
      video_code = "oEkJvvGEtB4" # default at Matsumoto speech :)
      video_code = tag.gsub(/\[|\]|((y|Y)(o|O)(u|U)(t|T)(u|U)(b|B)(e|E))\|/,"")
      # The parameters may be quite wrong for many youtube-videos..
      # Maybe add additional size-attributes to the custom tag.

      # wmode opaque: remember to stop event propagation
      # wmode window: goes over the content editing window


#      "<object class=\"stop_propagation\" id=\"yt_video_#{video_code}\" width=\"425\" height=\"344\">
#        <param name=\"wmode\" value=\"opaque\"></param>
#        <param name=\"movie\" value=\"http://www.youtube.com/v/#{video_code}&hl=en&fs=1\"></param>
#        <param name=\"allowFullScreen\" value=\"true\"></param>
#        <param name=\"allowscriptaccess\" value=\"always\"></param>
#        <embed src=\"http://www.youtube.com/v/#{video_code}&hl=en&fs=1\" type=\"application/x-shockwave-flash\" wmode=\"opaque\" allowscriptaccess=\"always\" allowfullscreen=\"true\" width=\"425\" height=\"344\"></embed>
#      </object>"

      # The above is here on one line, so there won't be any unnecessary spaces or newlines in the content.

      "<object class=\"stop_propagation\" id=\"yt_video_#{video_code}\" width=\"425\" height=\"344\"><param name=\"wmode\" value=\"opaque\"></param><param name=\"movie\" value=\"http://www.youtube.com/v/#{video_code}&hl=en&fs=1\"></param><param name=\"allowFullScreen\" value=\"true\"></param><param name=\"allowscriptaccess\" value=\"always\"></param><embed src=\"http://www.youtube.com/v/#{video_code}&hl=en&fs=1\" type=\"application/x-shockwave-flash\" wmode=\"opaque\" allowscriptaccess=\"always\" allowfullscreen=\"true\" width=\"425\" height=\"344\"></embed></object>"


    end
  end
end

# [[note|graph.note]]
module RedClothNoteExtension
  def note(text)
    # Do youtube-video-codes only have [a-zA-Z0-9] and "-" "_"?
    text.gsub!(/\[\[(n|N)(o|O)(t|T)(e|E)\|([a-zA-Z0-9]|-|_|\.)+\]\]/) do |tag|    
      note = tag.gsub(/\[|\]|((n|N)(o|O)(t|T)(e|E))\|/,"")
      attr = "class=\"external_link\""

      href = "" + note
      if href.gsub!(/\./, "#note=") == nil
        href = "#note=" + href
	attr = "class=\"internal_link\""
      end
       
      "<a href=\"#{href}\" #{attr}> #{note} </a>"
    end
  end
end


RedCloth.send(:include, RedClothYoutubeExtension)
RedCloth.send(:include, RedClothNoteExtension)

