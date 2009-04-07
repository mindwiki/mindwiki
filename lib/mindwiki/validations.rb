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
