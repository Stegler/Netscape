// dependencies
var db = require("../models");
var moment = require("moment");
var momentDurationFormatSetup = require("moment-duration-format");
moment().format();
momentDurationFormatSetup(moment);

module.exports = function(app) {
  // Load index page
  app.get("/", function(req, res) {
    res.render("index", {
      style: "styles.css"
    });
  });

  //load game page
  app.post("/game", function(req, res) {
    res.render("game", {
      style: "gamestyle.css",
      dataValue: req.body
    });
  });

  // load leader board
  app.get("/leaderboard", function(req, res) {
    res.render("leaderBoard", {
      style: "styles.css"
    });
  });

  //end game auto route to leader board with user score
  app.get("/leader/:name", function(req, res) {
    db.Users.findOne({
      where: {
        name: req.params.name
      },
      order: [["updatedAt", "DESC"]]
    }).then(function(result) {
      var user = result.dataValues;
      // formatting the time with moment.js
      var duration = moment.duration(user.bestTime, "milliseconds");
      var formmatedTime = duration.format("m:ss", { trim: false });

      user.bestTime = formmatedTime;

      res.render("leaderBoard", {
        style: "styles.css",
        finalScore: user
      });
    });
  });

  //if everything else route
  app.get("*", function(req, res) {
    res.render("404", {
      style: "styles.css"
    });
  });
};
