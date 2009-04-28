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
# Custom validations for Mindwiki
module Mindwiki::Validations

  # Validates color fields
  def validate_color(*attributes)
    error_message = ' needs to be a six digit hex value, e.g. #123456, #abba10.'
    attributes.each do |attribute|
      self.errors.add(attribute, error_message) unless valid_color?(self.send(attribute))
    end
  end
  def valid_color?(color)
    # W3C HTML & CSS standards only accept 16 color names
    return (color =~ /\A(#(\d|a|b|c|d|e|f){6,6})|(aqua)|(black)|(blue)|(fuchsia)|(gray)|(green)|(lime)|(maroon)|(navy)|(olive)|(purple)|(red)|(silver)|(teal)|(white)|(yellow)\Z/i)
  end

  # Checks if the input has bad tags (like <script>...</script>)
  # Currently uses the white_list-plugin, so it might be a great idea to use it in
  # input sanitization as well. 
  def validate_text(*attributes)
    error_message = ' can not contain malicious HTML-tags, e.g. <script>...</script>.'
    attributes.each do |attribute|
      self.errors.add(attribute, error_message) unless valid_tags?(self.send(attribute))
    end
  end
  def valid_tags?(data)
    return data == white_list(data)
  end
  
end

class ActiveRecord::Base
  include Mindwiki::Validations
end
