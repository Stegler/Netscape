var db = require('../models');
const path = require('path');
var Sequelize = require('sequelize');

const Op = Sequelize.Op;
module.exports = function(app) {
  // Get top 5 best time
  app.get('/api/leaders', function(req, res) {
    db.Users.findAll({
      where: {
        bestTime: {
          [Op.gt]: 0
        }
      },
      limit: 5,
      order: [['bestTime', 'ASC']]
    }).then(function(results) {
      res.json(results);
    });
  });

  app.post('/endgame', function(req, res) {
    db.Users.create(req.body).then(function(dbUser) {
      res.json(dbUser);
    });
  });
  // lender game level

  app.get('/mylevel.json', (req, res) => {
    const level = Math.floor(Math.random() * 2) + 1;
    console.log(`load level ${level} for user`);

    res.sendFile(path.join(__dirname, `../levels/level${level}.json`));
  });
};
