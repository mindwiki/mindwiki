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
