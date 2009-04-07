have_cron = true

begin
  require 'cronedit'
rescue MissingSourceFile
  have_cron = false
end

if have_cron
  include CronEdit

  # Run SyncLog purge script every 15 minutes
  Crontab.Add 'PurgeSyncLog', "*/15 * * * * #{RAILS_ROOT}/script/runner #{RAILS_ROOT}/lib/tasks/purge_sync_log.rb"

end
