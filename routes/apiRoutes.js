// var db = require('../models');
const path = require('path');
module.exports = function(app) {
  // lender game level

  app.get('/mylevel.json', (req, res) => {
    const level = Math.floor(Math.random() * 2) + 1;
    console.log(`load level ${level} for user`);

    res.sendFile(path.join(__dirname, `../levels/level${level}.json`));
  });
};
