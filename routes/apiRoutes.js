// dependencies

const db = require("../models");
const path = require("path");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = function(app) {
  // Get top 20 best time from database, front end can call $.get("/api/leaders") for the data
  app.get("/api/leaders", function(req, res) {
    db.Users.findAll({
      where: {
        bestTime: {
          [Op.gt]: 0
        }
      },
      limit: 20,
      // order by coins collected and monster kill
      order: [["treasurePoint", "DESC"], ["monstersKilled", "DESC"]]
    }).then(function(results) {
      // store the data in json format
      res.json(results);
    });
  });

  //post the final score that got from front end to database
  app.post("/endgame", function(req, res) {
    db.Users.create(req.body).then(function(dbUser) {
      res.json(dbUser);
    });
  });

  // render game next level --(ICE BOX CODE)
  // app.get("/mylevel.json", (req, res) => {
  //   const level = Math.floor(Math.random() * 2) + 1;
  //   console.log(`load level ${level} for user`);
  //   res.sendFile(path.join(__dirname, `../levels/level${level}.json`));
  // });
};
