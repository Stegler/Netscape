var db = require('../models');

module.exports = function(app) {
  // Load index page
  app.get('/', function(req, res) {
    res.render('index');
  });
  //load game page
  app.post('/game', function(req, res) {
    res.render('game', req.body);
  });

  app.get('/leader/:name', function(req, res) {
    db.Users.findOne({
      where: {
        name: req.params.name
      }
    }).then(function(result) {
      var user = result.dataValues;
      user.bestTime = user.bestTime / 1000;
      res.render('leaderBoard', user);
    });
  });

  app.post('/endgame', function(req, res) {
    db.Users.create(req.body).then(function(dbUser) {
      res.json(dbUser);
    });
  });

  // Render 404 page for any unmatched routes
  // app.get('*', function(req, res) {
  //   res.render('404');
  // });
};
