let unicorn;
let uImg;
let tImg;
let bImg;
let trains = [];
let soundClassifier;
let cnv;

function preload() {
  const options = {
    probabilityThreshold: 0.95
  };
  soundClassifier = ml5.soundClassifier('SpeechCommands18w', options);
  uImg = loadImage('/assets/images/unicorn.png');
  tImg = loadImage('/assets/images/train.png');
  bImg = loadImage('/assets/images/background.jpg');
}

function mousePressed() {
  trains.push(new Train());
}

function centerCanvas() {
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  cnv.position(x, y);
}

function setup() {
  cnv = createCanvas(800, 450);
  centerCanvas();
  unicorn = new Unicorn();
  soundClassifier.classify(gotCommand);
}

function windowResized() {
  centerCanvas();
}

function gotCommand(error, results) {
  if (error) {
    console.error(error);
  }
  console.log(results[0].label, results[0].confidence);
  if (results[0].label == 'up') {
    unicorn.jump();
  }
}

function keyPressed() {
  if (key == ' ') {
    unicorn.jump();
  }
}

function draw() {
  if (random(1) < 0.005) {
    trains.push(new Train());
  }

  background(bImg);
  for (let t of trains) {
    t.move();
    t.show();
    if (unicorn.hits(t)) {
      console.log('game over');
      noLoop();
    }
  }

  unicorn.show();
  unicorn.move();
}
