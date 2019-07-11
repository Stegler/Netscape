// var db = require('../models');
const path = require('path');
module.exports = function(app) {
  // Get all examples

  app.get('/mylevel.json', (req, res) => {
    const level = Math.floor(Math.random() * 2) + 1;
    console.log(`load level ${level} for user`);

    res.sendFile(path.join(__dirname, `../levels/level${level}.json`));
  });
  //   // Create a new example
  //   app.post('/api/examples', function(req, res) {
  //     db.Users.create(req.body).then(function(dbExample) {
  //       console.log(req.body);
  //       res.json(dbExample);
  //     });
  //   });

  //   // Delete an example by id
  //   app.delete('/api/examples/:id', function(req, res) {
  //     db.Example.destroy({ where: { id: req.params.id } }).then(function(dbExample) {
  //       res.json(dbExample);
  //     });
  //   });
};
