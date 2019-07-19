var config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    parent: "GameCanvas",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 750 },
            debug: false
        }
    },
    scene: {
        key: "main",
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload() {
    // map made with Tiled in JSON format
    this.load.tilemapTiledJSON("level1", "/assets/levels/level1.json");
    //  load tiles ground
    this.load.image("tiles", "/assets/images/tileset.png");
    //  load simple coin image
    this.load.image("treasure", "/assets/images/treasure.png");
    //  load simple background
    this.load.image("background", "/assets/images/background.png");
    // load player and player animations
    this.load.spritesheet("player", "assets/images/playerComplete.png", { frameWidth: 32, frameHeight: 44 });
    // load simple monster image
    this.load.image("monster", "/assets/images/monster.png");
    // load spike image
    this.load.image("spike", "/assets/images/groundspike.png");
    // load wall image
    this.load.image("wall", "/assets/images/wall.png");
    // Loading background music
    this.load.audio("backgroundMusic", "/assets/audio/backgroundMusic.mp3");
    // Load coin sound
    this.load.audio("coinSound", "/assets/audio/coin.mp3");
    // Load stomp sound
    this.load.audio("stompSound", "/assets/audio/stomp.mp3");
    // Load death sound
    this.load.audio("deathSound", "/assets/audio/death.mp3");
}

// List of variables to be used later in the game. 
var map;
var groundLayer;

var player;
var playerLives = 3;

var treasure;
var coinScore = 0; // Total coin number is 26.

var monster;
var numOfKilledMonster = 0; // Total mosnsters are 20.
var boxSpeed = 100;

var moveCam = false;
var cursors;

var backgroundMusic;
var coinSound;
var deathSound;
var stompSound;

var startTime = new Date();

function create() {
    // load the map
    map = this.make.tilemap({ key: "level1" });

    // load the background image
    this.add.image(600, 300, "background");

    // tiles for the ground layer
    var tileset = map.addTilesetImage("tileset", "tiles");

    // create the ground layer
    var groundLayer = map.createStaticLayer("Tiles", tileset, 0, 0);

    // the player will collide with this layer
    groundLayer.setCollisionByExclusion([-1]);

    // create invisible walls
    invisibleWalls = map.createFromObjects("Objects", "wall", { key: "wall" });
    this.physics.world.enable(invisibleWalls);
    for (var i = 0; i < invisibleWalls.length; i++) {
        invisibleWalls[i].body.setAllowGravity(false).setImmovable();
    }

    // set the boundaries of our game world
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;

    // create the player sprite
    player = this.physics.add.sprite(50, 830, "player", 2);
    player.setCollideWorldBounds(true); // don't go out of the map
    // Idle/walking/jumping/and dying animations. 
    this.anims.create({
        key: "idle",
        frames: [{ key: "player", frame: 2 }],
        frameRate: 20
    });
    this.anims.create({
        key: "walk",
        frames: this.anims.generateFrameNumbers("player", { start: 0, end: 6 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: "jump",
        frames: this.anims.generateFrameNumbers("player", { start: 7, end: 13 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: "die",
        frames: this.anims.generateFrameNumbers("player", { start: 14, end: 20 }),
        frameRate: 10,
        repeat: -1
    });

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
    Coins = map.createFromObjects("Objects", "treasure", { key: "treasure" });
    this.physics.world.enable(Coins);
    for (var i = 0; i < Coins.length; i++) {
        Coins[i].body.setAllowGravity(false);
    };

    // Create invisible walls for monsters to run into
    InvisibleWalls = map.createFromObjects("Objects", "wall", { key: "wall" });
    this.physics.world.enable(InvisibleWalls);
    for (var i = 0; i < InvisibleWalls.length; i++) {
        InvisibleWalls[i].body.setAllowGravity(false).immovable = true;
    };
    // Create enemy objects
    Monsters = map.createFromObjects("Objects", "monster", { key: "monster" });
    this.physics.world.enable(Monsters);
    console.log(Monsters);
    // Adds movement for all the enemies
    for (var i = 0; i < Monsters.length; i++) {
        Monsters[i].body.velocity.x = boxSpeed;
    };
    this.physics.add.collider(groundLayer, Monsters);

    // Create spikes around map
    // Objects is the Name of the objets layer. treasure is name of objects within object layer
    Spikes = map.createFromObjects("Objects", "spike", { key: "spike" });
    this.physics.world.enable(Spikes);
    for (var i = 0; i < Spikes.length; i++) {
        Spikes[i].body.setAllowGravity(false);
    };

    // Create all our collision functions.
    this.physics.add.collider(player, Spikes, SpikeDeath, null, this);
    this.physics.add.collider(player, Monsters, playerMonster, null, this);
    this.physics.add.collider(player, Coins, collectCoin, null, this);
    this.physics.add.collider(InvisibleWalls, Monsters, Bounce, null, this);
    this.physics.add.collider(Monsters, Monsters, Bounce, null, this);



    // Adding all of our music into the game
    backgroundMusic = this.sound.add("backgroundMusic");
    coinSound = this.sound.add("coinSound", { volume: 0.01 });
    deathSound = this.sound.add("deathSound", { volume: 0.3 });
    stompSound = this.sound.add("stompSound", { volume: 0.1 });
    backgroundMusic.play({
        volume: 0.05,
        loop: true
    });
};

function update() {
    // These are all the input commands for the game. Moving also causes player to play animations. 
    if (cursors.right.isDown) {
        if (player.body.onFloor()) {
            player.play("walk", true);
        } else {
            player.play("jump", true);
        }
        player.flipX = false;
        player.body.setVelocityX(180);
    }
    else if (cursors.left.isDown) {
        if (player.body.onFloor()) {
            player.play("walk", true);
        } else {
            player.play("jump", true);
        }
        player.flipX = true;
        player.body.setVelocityX(-180);
    }
    else {
        if (player.body.onFloor()) {
            player.play("idle");
        } else {
            player.play("jump", true);
        }
        player.body.setVelocityX(0);
    }
    if ((cursors.up.isDown || cursors.space.isDown) && player.body.onFloor()) {
        player.body.setVelocityY(-400);
    }

};

// External function to collect coins
function collectCoin(player, Coins) {
    Coins.destroy(Coins.x, Coins.y); // remove the tile/coin
    coinSound.play();
    coinScore++;
    checkCoins();
    // show current coins collected on html
    $("#coinCollected").text(coinScore);
    console.log("Treasure collected!");
};

// Win condition function for when all coins collected
function checkCoins() {
    if (coinScore == 26) {
        Gameover();
    }
};

// Only run playerKillMonster if player lands on monster head
function playerMonster(player, Monsters) {
    if (player.body.touching.down) {
        Monsters.destroy(Monsters.x, Monsters.y); // Kill monster! Jump on head
        $("#monsterKilled").text(numOfKilledMonster);
        numOfKilledMonster++;
        stompSound.play();
        console.log("Monster Squished!");
    } else if (player.body.touching.left || player.body.touching.right) {
        Death(player);
    }
};

// Function for when player jumps on spikes
function SpikeDeath(player, Spikes) {
    Death(player);
};

// This function makes the monsters "bounce" off the walls and reverse direction. The walls are invisible blocks maode in Tiled.
function Bounce(InvisibleWalls, Monsters) {
    if (Monsters.body.touching.right || Monsters.body.blocked.right) {
        Monsters.body.velocity.x = -boxSpeed; // turn left
    } else if (Monsters.body.touching.left || Monsters.body.blocked.left) {
        Monsters.body.velocity.x = boxSpeed; // turn right
    }
};


// This function occurs when the player 'dies'. 
function Death() {
    playerLives--;
    $("#live").text(playerLives);
    CheckLives();
    deathSound.play();
    player.x = 50;
    player.y = 830;
};

function CheckLives() {
    if (playerLives === 0) {
        Gameover();
    }
};

function Gameover() {
    const user = document.getElementById("user").value;
    var endTime = new Date();
    var endScore = {
        name: user,
        treasurePoint: coinScore,
        monstersKilled: numOfKilledMonster,
        bestTime: endTime - startTime
    };

    $.post("/endgame", endScore, function (data) {
        console.log(data);
        // Redirect player to the leader board Screen
        window.location = "/leader/" + user;
    });
};

// timer for game end
setTimeout(() => {
    Gameover();
}, 1000 * 60 * 3);

// set game time count

setInterval(currentTime, 1000);

function currentTime() {
    var currentTime = new Date();
    different = currentTime - startTime;
    duration = moment.duration(different, "milliseconds");
    $("#time").text(duration.format("m:ss", { trim: false }));
};

//let set refresh the top 5 every minute
updateGameTop5();

setInterval(updateGameTop5, 1000 * 60);

// Make a get request to our api route that will return top 5 players
function updateGameTop5() {
    $.get("/api/leaders", function (data) {
        // For each book that our server sends us back
        $(".table-dark > tbody").html("");

        if (data.length > 5) {
            for (var i = 0; i < 5; i++) {
                var duration = moment.duration(data[i].bestTime, "milliseconds");
                var formmatedTime = duration.format("m:ss", { trim: false });

                $(".table-dark > tbody").append($("<tr>").append($("<td>").text([i + 1]), $("<td>").text(data[i].name), $("<td>").text(data[i].treasurePoint), $("<td>").text(data[i].monstersKilled), $("<td>").text(formmatedTime)));
            }
        } else {
            for (var i = 0; i < data.length; i++) {
                var duration = moment.duration(data[i].bestTime, "milliseconds");
                var formmatedTime = duration.format("m:ss", { trim: false });

                $(".table-dark > tbody").append($("<tr>").append($("<td>").text([i + 1]), $("<td>").text(data[i].name), $("<td>").text(data[i].treasurePoint), $("<td>").text(data[i].monstersKilled), $("<td>").text(formmatedTime)));
            }
        }
    });
};
