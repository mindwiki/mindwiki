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
require 'test_helper'

class ArticleTest < ActiveSupport::TestCase
  fixtures :articles, :notes

  test "Creation" do
    assert_difference "Article.count" do
      art = Article.new({:content => "Hello!", :content_type => 1})
      assert art.save
    end
    assert_difference "Article.count" do
      art2 = Article.new({:content => "Hi"})
      assert art2.save # Should save without content_type
      assert_equal 1, art2.content_type # Model should default content_type to 1
    end
  end

  test "Deletion" do
    assert_difference "Article.count", -1 do
      assert_difference "Note.count", -1 do # Deleting the article also deletes the associated notes
        art = Article.find(articles(:ruby_art).id)
        art.destroy
      end
    end
  end
  
  test "Content validation" do
    art = Article.find(articles(:ruby_art).id)

    # These loops might be a bit annoying when debugging, because the line number isn't
    # the failing input's line number. Maybe just copy-paste in other tests.
    
    # Should be valid content
    [
      'h1. RedCloth header',
      'Basic text',
      '<p>Paragraph</p>',
      '<ul><li>Unordered List Item 1</li></ul>',
      ''
    ].each do |v|
      assert art.update_attributes(:content => v)
    end

    # Should be invalid    
    [
      # There should be more invalid stuff. See white_list test-suite and maybe copy-paste here :)
      '<script>alert("Annoying. Potentially dangerous.");</script>'
    ].each do |inv|
      assert_equal false, art.update_attributes(:content => inv)
    end
  end

  test "Content type validation" do
    art = Article.find(articles(:ruby_art).id)
    
    # Should do
    [
      1,
      10,
      9999,
      -100,
    ].each do |v|
      assert art.update_attributes(:content_type => v)
    end
    
    # Should bounce
    [
      nil,
      '',
      'blah',
      4.5
    ].each do |inv|
      assert_equal false, art.update_attributes(:content_type => inv)
    end
  end
  
end
