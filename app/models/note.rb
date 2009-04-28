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
class Note < ActiveRecord::Base

  belongs_to :article #, :dependent => :destroy # does not work yet. Rails ticket 1079. Workaround method for now.
  belongs_to :graph
  validates_presence_of :graph
  
  # Edges don't depend on other objects, so :delete_all is safe. (Faster than :destroy)
  has_many :edges_from, :foreign_key => "source_id", :class_name => "Edge", :dependent => :delete_all
  has_many :edges_to, :foreign_key => "target_id", :class_name => "Edge", :dependent => :delete_all

  validates_presence_of :name
  # No checking of "traditionally sane" x/y values, cause after viewport integration these
  # virtual coordinates might very well be negative.
  validates_numericality_of :x, :only_integer => true
  validates_numericality_of :y, :only_integer => true
  validates_numericality_of :width, :greater_than_or_equal_to => 20, :less_than => 9999, :only_integer => true
  validates_numericality_of :height, :greater_than_or_equal_to => 20, :less_than => 9999, :only_integer => true

  # Z-order is used for HTML-layering via CSS
  validates_numericality_of :zorder, :only_integer => true

  def validate
    validate_color('color')
    validate_text('name')
  end
  
  #belongs_to :dependent => :destroy does not work yet. Rails ticket 1079. Workaround method for now.
  def after_destroy
    # Check to see if other notes still reference the article. If not, the destroy the article, too.
    if self.article.nil?
      return
    end
    if !Note.find(:first, :conditions => {:article_id => self.article_id})
      art = Article.find(self.article_id)
      if !art.nil?
        art.destroy
      end
    end
    SyncLog.note_destroy(self.graph.id, self.id)
  end

  #after_update { |note| SyncLog.note_update(note.graph.id, note) }

  #after_create { |note| SyncLog.note_create(note.graph.id, note) }
  #after_create :log_new_note
  
  def log_new_note
    SyncLog.note_create_new(self.graph.id, self)
  end
  
end
