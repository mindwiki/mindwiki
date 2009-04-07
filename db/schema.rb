# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20090308113028) do

  create_table "articles", :force => true do |t|
    t.text     "content"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "content_type", :default => 1
  end

  create_table "edges", :force => true do |t|
    t.integer  "source_id"
    t.integer  "target_id"
    t.boolean  "directed"
    t.string   "name"
    t.string   "color"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "graphs", :force => true do |t|
    t.string   "name"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "color"
  end

  create_table "notes", :force => true do |t|
    t.string   "name"
    t.integer  "x"
    t.integer  "y"
    t.integer  "width"
    t.integer  "height"
    t.string   "color"
    t.integer  "article_id"
    t.integer  "graph_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "zorder",     :default => 10
  end

  create_table "sync_logs", :force => true do |t|
    t.datetime "created_at"
    t.integer  "graph_id"
    t.text     "params"
    t.string   "sessionid"
  end

  add_index "sync_logs", ["created_at", "graph_id"], :name => "time_graph_index"

  create_table "users", :force => true do |t|
    t.string   "login"
    t.string   "email"
    t.string   "crypted_password",          :limit => 40
    t.string   "salt",                      :limit => 40
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "remember_token"
    t.datetime "remember_token_expires_at"
    t.boolean  "deleted",                                 :default => false
    t.boolean  "admin",                                   :default => false
  end

end
