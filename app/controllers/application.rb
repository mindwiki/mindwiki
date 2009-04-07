# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  include AuthenticatedSystem
  helper :all # include all helpers, all the time
  before_filter :login_required

  # See ActionController::RequestForgeryProtection for details
  # Uncomment the :secret if you're not using the cookie session store

# COMMENTED THE FORGERY PROTECTION. FIGURE OUT HOW TO WORK WITH IT!

#  protect_from_forgery # :secret => 'ebda8aa1868d052752380ed8b1245192'
  
  # See ActionController::Base for details 
  # Uncomment this to filter the contents of submitted sensitive data parameters
  # from your application log (in this case, all fields with names like "password"). 
  # filter_parameter_logging :password
  
  layout proc{ |c| c.request.xhr? ? false : "application" }
end
