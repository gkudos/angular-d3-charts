desc "compile and run the site"
task :default do
  pids = [
    spawn("jekyll serve -w --baseurl ''"), # put `auto: true` in your _config.yml
    spawn("sass --watch _sass:css"),
    spawn("coffee -b -w -o js -c coffee/*.coffee")
  ]

  trap "INT" do
    Process.kill "INT", *pids
    exit 1
  end

  loop do
    sleep 1
  end
end
