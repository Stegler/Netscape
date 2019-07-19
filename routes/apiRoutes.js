var db = require("../models");
var path = require("path");
var Sequelize = require("sequelize");

var Op = Sequelize.Op;
module.exports = function(app) {
  // Get top 5 best time
  app.get("/api/leaders", function(req, res) {
    db.Users.findAll({
      where: {
        bestTime: {
          [Op.gt]: 0
        }
      },
      limit: 20,
      order: [["treasurePoint", "DESC"], ["monstersKilled", "DESC"]]
    }).then(function(results) {
      res.json(results);
    });
  });

  app.post("/endgame", function(req, res) {
    db.Users.create(req.body).then(function(dbUser) {
      res.json(dbUser);
    });
  });
  // lender game level

  //   app.get("/mylevel.json", (req, res) => {
  //     var level = Math.floor(Math.random() * 2) + 1;
  //     console.log(`load level ${level} for user`);

  //   //   res.sendFile(path.join(__dirname, `../levels/level${level}.json`));
  //   // });
};
