var db = require('../models');

module.exports = function(app) {
  // Load index page
  app.get('/', function(req, res) {
    res.render('index');
  });
  //load game page
  app.post('/game', function(req, res) {
    db.Users.create(req.body).then(function(db_user) {
      res.render('game', db_user.dataValues);
    });
  });

  app.get('/leaderboard', function(req, res) {
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
  