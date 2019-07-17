var config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  parent: 'GameCanvas',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 750 },
      debug: false
    }
  },
  scene: {
    key: 'main',
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);

var map;
var groundLayer;

var player;
var playerLives = 3;

var treasure;
var monster;
var coinScore = 0; // Total coin number is 26.

var moveCam = false;
var cursors;
var startTime = new Date();
function preload() {
  // map made with Tiled in JSON format
  this.load.tilemapTiledJSON('level1', '/assets/levels/level1.json');
  //  load tiles ground
  this.load.image('tiles', '/assets/images/tileset.png');
  //  load simple coin image
  this.load.image('treasure', '/assets/images/treasure.png');
  //  load simple background
  this.load.image('background', '/assets/images/background.png');
  // load player and player animations
  this.load.image('player', 'assets/images/player.png');
  // load simple monster image
  this.load.image('monster', '/assets/images/monster.png');
  // load spike image
  this.load.image('spike', '/assets/images/groundspike.png');
}

function create() {
  // load the map
  map = this.make.tilemap({ key: 'level1' });

  // load the background image
  this.add.image(600, 300, 'background');

  // tiles for the ground layer
  var tileset = map.addTilesetImage('tileset', 'tiles');

  // create the ground layer
  var groundLayer = map.createStaticLayer('Tiles', tileset, 0, 0);

  // the player will collide with this layer
  groundLayer.setCollisionByExclusion([-1]);

  // set the boundaries of our game world
  this.physics.world.bounds.width = groundLayer.width;
  this.physics.world.bounds.height = groundLayer.height;

  // create the player sprite
  player = this.physics.add.sprite(50, 830, 'player');
  player.setCollideWorldBounds(true); // don't go out of the map

  // Physics so player can't fall through any groundlayer variable. AKA the tiles.
  this.physics.add.collider(groundLayer, player);

  // This creates cursor commands for movement.
  cursors = this.input.keyboard.createCursorKeys();

  // set bounds so the camera won't go outside the game world
  this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  // make the camera follow the player
  this.cameras.main.startFollow(player);

  // Create coins objects
  // Objects is the Name of the objets layer. treasure is name of objects within object layer
  Coins = map.createFromObjects('Objects', 'treasure', { key: 'treasure' });
  console.log(Coins);
  this.physics.world.enable(Coins);
  for (var i = 0; i < Coins.length; i++) {
    Coins[i].body.setAllowGravity(false);
  }

  this.physics.add.collider(player, Coins, collectCoin, null, this);

  // Create enemy objects
  Monsters = map.createFromObjects('Objects', 'monster', { key: 'monster' });

  this.physics.world.enable(Monsters);
  this.physics.add.collider(groundLayer, Monsters);

  // Adds movement for all the enemies
  for (var i = 0; i < Monsters.length; i++) {
    // Monsters[i].body.velocity.x = 100;
  }

  this.physics.add.collider(player, Monsters, playerKillMonster, null, this);

  // Create spikes around map
  // Objects is the Name of the objets layer. treasure is name of objects within object layer
  Spikes = map.createFromObjects('Objects', 'spike', { key: 'spike' });

  this.physics.world.enable(Spikes);
  for (var i = 0; i < Spikes.length; i++) {
    Spikes[i].body.setAllowGravity(false);
  }

  this.physics.add.collider(player, Spikes, SpikeDeath, null, this);
}

function update() {
  if (cursors.left.isDown) {
    // if the left arrow key is down
    player.body.setVelocityX(-160); // move left
  } else if (cursors.right.isDown) {
    // if the right arrow key is down
    player.body.setVelocityX(160); // move right
  } else {
    player.setVelocityX(0);
  }
  if ((cursors.space.isDown || cursors.up.isDown) && player.body.onFloor()) {
    player.body.setVelocityY(-400); // jump up
  }
}

// External function to collect coins
function collectCoin(player, Coins) {
  Coins.destroy(Coins.x, Coins.y); // remove the tile/coin
  coinScore++;
  checkCoins();
  console.log('Treasure collected!');
}

function SpikeDeath(player, Spikes) {
  player.destroy(player.x, player.y);
  playerLives--;
  console.log('Avoid the spikes dummy!' + playerLives);
  checkLives();
  Respawn();
}

// Only run player kill monster if player lands on monster head
function playerKillMonster(player, Monsters) {
  Monsters.destroy(Monsters.x, Monsters.y); // Kill monster! Jump on head

  console.log('Monster Squished!');
}

// Only run monster kill player if player horizontal to monster
function monsterKillPlayer(player, Monsters) {
  player.destroy(player.x, player.y);
  playerLives--;
  checkLives();
  Respawn();
}

function checkCoins() {
  if (coinScore == 26) {
    Gameover();
  }
}

function checkLives() {
  if (playerLives > 0) {
    Respawn();
  }
  if (playerLives == 0) {
    Gameover();
  }
}

function Respawn() {
  // Recreate the player at the start zone
}

function Gameover() {
  const user = document.getElementById('user').value;
  var endTime = new Date();
  var endScore = {
    name: user,
    treasurePoint: coinScore,
    bestTime: endTime - startTime
  };

  // Redirect player to the Game Over Screen
  //post the result to database
  $.post('/endgame', endScore, function(data) {
    console.log(data);
    // Redirect player to the leader board Screen
    window.location = '/leader/' + user;
  });
}

// timer for game end
setTimeout(() => {
  Gameover();
}, 1000 * 30);

//same function as Gameover()
// function winGame() {
//   // End the game
//   Gameover();
//   // Display Clear Time / Max Coins collected.
//   // Redirect player to Score Screen
// }
