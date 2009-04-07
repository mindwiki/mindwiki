require 'white_list_helper'
ActionView::Base.send :include, WhiteListHelper
ActionController::Base.send :include, WhiteListHelper
ActiveRecord::Base.send :include, WhiteListHelper
