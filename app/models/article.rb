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
class Article < ActiveRecord::Base
  has_many :notes, :dependent => :destroy
  
  default_value_for :content_type, 1
  validates_numericality_of :content_type, :only_integer => true
  
  def validate
    validate_text('content')
  end
  
  attr_accessor :redcloth_rendering

  def redcloth_update
    self.redcloth_rendering = ""
    if self.content_type == 1
      self.redcloth_rendering = RedCloth.new(white_list(content),[:filter_styles]).to_html(:textile, :youtube, :note)
    end
  end


  # Custom xml serialization (to include RedCloth rendering on content-type 1)
  def to_xml(options = {})
    options[:indent] ||= 2
    xml = options[:builder] ||= Builder::XmlMarkup.new(:indent => options[:indent])
    xml.instruct! unless options[:skip_instruct]
    xml.article do
      # TODO: Include datatypes
      xml.tag!(:id, id.to_s) 
      xml.tag!(:content, content)
      if content_type == 1
        xml.tag!(:content_rendered, self.redcloth_rendering)
      end
      xml.tag!(:content_type, content_type.to_s)
      xml.tag!(:updated_at, updated_at.to_s)
      xml.tag!(:created_at, created_at.to_s)
    end
  end
  
  def after_update
    self.redcloth_update()
    SyncLog.article_update(self)
  end

  # When ever the content is changed, we shall render it
  def after_validation
    self.redcloth_update()
  end
  
  # When ever content is loaded, we shall render it
  def after_find
    self.redcloth_update()
  end
  
end
