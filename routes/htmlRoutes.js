var db = require('../models');

module.exports = function(app) {
  // Load index page
  app.get('/', function(req, res) {
    res.render('index');
  });
  //load game page
  app.get('/game', function(req, res) {
    res.render('game');
  });

  app.get('/leader', function(req, res) {
    res.render('leaderBoard');
  });

  app.get('/endgame', function(req, res) {
    res.render('endgame');
  });

  // Render 404 page for any unmatched routes
  // app.get('*', function(req, res) {
  //   res.render('404');
  // });
};
