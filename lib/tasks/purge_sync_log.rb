t_local = Time.now
t_gmt = t_local.gmtime
t = t_gmt-(15*60) # 15 minutes
oldies = SyncLog.find(:all, :conditions => [ "created_at < ?", t ])
oldies.each do |d|
  tmp = SyncLog.find(d.id)
  tmp.destroy
end
