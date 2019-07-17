var db = require('../models');

module.exports = function(app) {
  // Load index page
  app.get('/', function(req, res) {
    res.render('index', {
      style: 'styles.css'
    });
  });
  //load game page
  app.post('/game', function(req, res) {
    res.render('game', {
      style: 'gamestyle.css',
      dataValue: req.body
    });
  });

  // load leader board

  app.get('/leaderboard', function(req, res) {
    res.render('leaderBoard', {
      style: 'styles.css'
    });
  });

  //end game auto route to leader board with user score
  app.get('/leader/:name', function(req, res) {
    db.Users.findOne({
      where: {
        name: req.params.name
      },
      order: [['updatedAt', 'DESC']]
    }).then(function(result) {
      var user = result.dataValues;
      user.bestTime = user.bestTime / 1000;
      res.render('leaderBoard', {
        style: 'styles.css',
        finalScore: user
      });
    });
  });
};
