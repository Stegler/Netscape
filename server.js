require("dotenv").config();
var express = require("express");
var exphbs = require("express-handlebars");
// var path = require('path');
var db = require("./models");
var app = express();
var PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));

// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Routes
require("./routes/apiRoutes")(app);
require("./routes/htmlRoutes")(app);

// app.get('/', (req, res) => {
//   // res.sendFile(path.join(__dirname, 'index.html'));
//   res.send('hi');
// });

// app.get('/win', (req, res) => {
//   console.log('...increase user level...');
//   res.send('OK');
// });

//===================
//Listen
var syncOptions = { force: false };

// If running a test, set syncOptions.force to true

if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}

// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync().then(function() {
  app.listen(PORT, function() {
    console.log(
      "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
      PORT,
      PORT
    );
  });
});

module.exports = app;
