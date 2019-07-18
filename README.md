# Netscape

```sequence {theme="hand"}
Title: Route sequence diagram

New tab-->htmlRoute.js: get("/) a start page

htmlRoute.js-->>Start Page: get("/), render("index")

Note right of Start Page: Start Page \n 1. Input box form with \n StartButton\n 2. LeaderBoard with \n get("/lederboard")

Note left of Start Page: Start Page \n 1. Input form action \n action="/game" \n method="POST"
Start Page-->> Leader Page:2. get("/lederboard")

Start Page-->> htmlRoute.js: 1. post("/game") + \n data player name

htmlRoute.js-->>Game Page:post("/game"), \n data: name value from input box, render("game"),

Note left of Game Page: GamePage.html \n 1. post the name  \n value to hidden input form \n in html

Note right of Game Page: GamePage.js \n Gameover() fucntion for \n 1. store the data to db \n post("/endgame") & endScore data \n 2. render leaderboad page \n  get("/leader/" + user)

Game Page-->> apiRoute.js:1 . post("/endgame") & endScore data

Note left of apiRoute.js : apiRoute.js \n post("/endgame") , \n db.Users.create(req.body)

Game Page-->> htmlRoute.js: 2. get("/leader/" + user)

htmlRoute.js-->>Leader Page: get("/leader/" + user) \n db.Users.findOne where: name: req.params.name,\n render("leaderBoard")







```

To run electron

\$npm run electron
