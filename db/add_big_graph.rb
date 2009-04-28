# This can be run with script/runner
notes = 50
lines = 29

# Create a new graph
u = User.find(1)
g = Graph.new({:name => "Big graph with "+notes.to_s+" random notes", :color => "#abba10"})
g.user = u
g.save


# On how big an area should the notes be randomly distributed
area_w = 1000
area_h = 1000

# Random color
def randco
  return "#"+("%06s" % (rand(2**(8*3)).to_s(base=16)))
end

note_ids = Array.new
notes.times do
  a = Article.new({:content => "Try automatic org with this :D"})
  a.save
  n = Note.new({
    :name => "Note", 
    :x => rand(area_w)-(area_w/2).ceil, 
    :y => rand(area_h)-(area_h/2).ceil,
    :width => 200,
    :height => 100,
    :color => randco(),
    :zorder => 10
  })
  n.graph = g
  n.article = a
  n.save
  note_ids.push(n.id)
end


lines.times do
  e = Edge.new({
    :name => "WOOSH!",
    :color => randco()
  })
  # If notes are same, or there is already a note from dst to src, it will not do
  begin
  src_candidate = Note.find(note_ids[rand(note_ids.count)])
  dst_candidate = Note.find(note_ids[rand(note_ids.count)])
  e.source_note = src_candidate
  e.target_note = dst_candidate
    e.save
  rescue
    puts "Duplicate line. Not creating this one..."
  end 
end
