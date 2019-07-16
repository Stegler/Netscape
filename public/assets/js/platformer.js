var config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 640,
  parent: 'GameCanvas',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
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
var player;
var cursors;
var groundLayer;
var treasure;
var monster;
var text;

function preload() {
  // map made with Tiled in JSON format
  this.load.tilemapTiledJSON('level1', '/assets/levels/level1.json');
  //  load tiles ground
  this.load.image('ground', '/assets/images/ground.png', { frameWidth: 32, frameHeight: 32 });
  //  load simple coin image
  this.load.image('treasure', '/assets/images/treasure.png');
  //  load simple background
  this.load.image('background', '/assets/images/background.png');
  //  load simple player image
  this.load.image('player', '/assets/images/player.png');
  // load simple monster image
  this.load.image('monster', '/assets/images/monster.png');
}

function create() {
  // load the map
  map = this.make.tilemap({ key: 'level1' });

  // load the background image
  this.add.image(600, 300, 'background');

  // tiles for the ground layer
  var groundTiles = map.addTilesetImage('ground');

  // create the ground layer
  groundLayer = map.createDynamicLayer('Map Blocks', groundTiles, 0, 0);

  // the player will collide with this layer
  groundLayer.setCollisionByExclusion([-1]);

  // set the boundaries of our game world
  this.physics.world.bounds.width = groundLayer.width;
  this.physics.world.bounds.height = groundLayer.height;

  // create the player sprite
  player = this.physics.add.sprite(50, 580, 'player');
  player.setBounce(0.2); // our player will bounce from items
  player.setCollideWorldBounds(true); // don't go out of the map

  // Physics so player can't fall through any groundlayer variable. AKA the tiles.
  this.physics.add.collider(groundLayer, player);

  // This creates cursor commands for movement.
  cursors = this.input.keyboard.createCursorKeys();

  // Creating some coin objects from our object layer from JSON
  this.treasure = this.physics.add.group({
    allowGravity: false,
    immovable: true
  });
}

function update() {
  if (cursors.left.isDown) {
    // if the left arrow key is down
    player.body.setVelocityX(-200); // move left
  } else if (cursors.right.isDown) {
    // if the right arrow key is down
    player.body.setVelocityX(200); // move right
  }
  if ((cursors.space.isDown || cursors.up.isDown) && player.body.onFloor()) {
    player.body.setVelocityY(-400); // jump up
  }
}

// set time out and post data to server, lender to leader board when it timeout
var startTime = new Date();

setTimeout(() => {
  const user = document.getElementById('user').value;
  // console.log(user);
  var endTime = new Date();
  // window.location = '/endgame/';
  var endScore = {
    name: user,
    treasurePoint: '0',
    bestTime: endTime - startTime
  };

  $.post('/endgame', endScore, function(data) {
    console.log(data);
    window.location = '/leader/' + user;
  });
}, 1000 * 60);
