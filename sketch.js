let areaImage; // Area: Terrain Image
let tankImage1; // Red Tank
let tankImage2; // Green Tank
let bgImage; // Background

// area
let board = []; // It's used for creating Polygon area.
let area; // border of area
let areaBg; // terrian

// players
let turn = 0; // Player turn(0/1)
let power1 = 10; // Initial power
let power2 = 10; // Initial power
let angle1 = 315; // Initial angle
let angle2 = 225; // Initial angle
const MAX_POWER = 100; // Max POWER
let explodeRadius = 30; // explosion range
let prevPos; // temporary

// control
let fire = false; // SPACE key
let bomb = null; // Bomb

// time
let start, end; // TIME

// Srpites
let tank1, tank2; // TANK A, B
let stick1, stick2;
let explode = null; // Explosion sprite
let bground; // background sprite

function preload() {
  // Load necessary images

  // areaImage = loadImage('images/area.png');   // terrain
  // tankImage1 = loadImage('images/red.png');   // red   tank (A)
  // tankImage2 = loadImage('images/green.png'); // green tank (B)
  // bgImage = loadImage('images/background.png'); // background (sky)

  areaImage = loadImage('http://95.217.51.146:5000/area.png');   // terrain
  tankImage1 = loadImage('http://95.217.51.146:5000/red.png');   // red   tank (A)
  tankImage2 = loadImage('http://95.217.51.146:5000/green.png'); // green tank (B)
  bgImage = loadImage('http://95.217.51.146:5000/background.png'); // background (sky)
}

function setup() {
  createCanvas(600, 400);

  // set gravity
  world.gravity.y = 20;

  // reset image size
  areaImage.resize(600, 400);

  /////////////////
  // Load Images //
  /////////////////

  // create a box (outline) - RECT
  box = new Sprite(300, 200, 600, 400, 's');
  box.shape = 'chain';
  box.textSize = 40;
  box.textColor = 'red';
  box.layer = 2;

  // create tanks
  tankImage1.resize(24, 6);
  tankImage2.resize(24, 6);
  tank1 = createSprite(12, 3, 24, 6);
  tank1.addImage(tankImage1);
  tank2 = createSprite(12, 3, 24, 6);
  tank2.addImage(tankImage2);

  // tank - configuration
  tank1.friction = 1;
  tank1.bounciness = 0;
  tank1.strokeWeight = 0;
  tank1.x = 150;
  tank1.y = 85;

  tank2.friction = 1;
  tank2.bounciness = 0;
  tank2.strokeWeight = 0;
  tank2.x = 470;
  tank2.y = 395;

  // create sticks
  stick1 = createSprite(0, 0, 12, 2, 'n')
  stick1.fill = 'red';
  stick1.stroke = 'red';
  stick1.offset.x = 6;
  stick2 = createSprite(0, 0, 12, 2, 'n')
  stick2.fill = 'green';
  stick2.stroke = 'green';
  stick2.offset.x = 6;

  // set background
  bground = createSprite(300, 200, 600, 400, 'n');
  bground.addImage(bgImage);
  bground.layer = 0;

  createArea();
}

function draw() {

  background(10, 20, 20, 255);

  if (explode != null) {

    // Draw Explosion

    explode.diameter += 2;

    if (explode.overlap(tank2)) {
      console.log('crashed')
      box.text = 'win: Player 1';
    } else if (explode.overlap(tank1)) {
      console.log('crashed')
      box.text = 'win: Player 2';
    } else if (explode.diameter > explodeRadius * 2) {

      subtractExplodedRegion()

      explode.remove();
      explode = null;
    }

    frameRate(16);
    return;
  }

  // Key Down

  // Movement
  if (kb.pressing('D')) {
    if (turn == 0) {
      prevPos = tank1.position;
      tank1.vel.x = 8;
      tank1.vel.y = 10;//0.1;
    } else {
      prevPos = tank2.position;
      tank2.vel.x = 8;
      tank2.vel.y = 10;//0.1;
    }
  }
  if (kb.pressing('A')) {
    if (turn == 0) {
      prevPos = tank1.position;
      tank1.vel.x = -8;
      tank1.vel.y = 10;//0.1;
    } else {
      prevPos = tank2.position;
      tank2.vel.x = -8;
      tank2.vel.y = 10;//0.1;
    }
  }

  // Tank Configuration
  if (kb.presses(LEFT_ARROW)) {
    start = Date.now()
    turn == 0 ? angle1-- : angle2--;
  }
  if (kb.presses(RIGHT_ARROW)) {
    start = Date.now()
    turn == 0 ? angle1++ : angle2++;
  }
  if (kb.presses(UP_ARROW)) {
    start = Date.now()
    turn == 0 ? power1++ : power2++;
  }
  if (kb.presses(DOWN_ARROW)) {
    start = Date.now()
    turn == 0 ? power1-- : power2--;
  }

  // If user presses the arrow key for a long time, 
  // accelerates the speed of power and angle
  if (Date.now() - start > 500) {
    amount = 1;
    if (Date.now() - start > 2500) { amount = 10; }
    if (Date.now() - start > 5000) { amount = 25; }

    if (kb.pressing(LEFT_ARROW)) {
      turn == 0 ? angle1 -= amount : angle2 -= amount;
    }
    if (kb.pressing(RIGHT_ARROW)) {
      turn == 0 ? angle1 += amount : angle2 += amount;
    }
    if (kb.pressing(UP_ARROW)) {
      turn == 0 ? power1 += amount : power2 += amount;
    }
    if (kb.pressing(DOWN_ARROW)) {
      turn == 0 ? power1 -= amount : power2 -= amount;
    }
  }

  // limit of power & angle
  if (angle1 < 180) angle1 = 180;
  if (angle2 < 180) angle2 = 180;
  if (angle1 > 360) angle1 = 360;
  if (angle2 > 360) angle2 = 360;
  if (power1 > MAX_POWER) power1 = MAX_POWER;
  if (power2 > MAX_POWER) power2 = MAX_POWER;
  if (power1 < 1) power1 = 1;
  if (power2 < 1) power2 = 1;

  // reset stick pos
  // Following the tank position
  stick1.position.x = tank1.position.x
  stick1.position.y = tank1.position.y - 3
  stick1.rotation = angle1
  stick2.position.x = tank2.position.x
  stick2.position.y = tank2.position.y - 3
  stick2.rotation = angle2

  // Fire!!!
  if (kb.presses(' ')) {
    if (fire) { return; }

    // set to fire
    fire = true;

    if (turn == 0) {
      let x = cos(angle1) * 16;
      let y = sin(angle1) * 16;

      bomb = new Sprite(
        tank1.position.x + x,
        tank1.position.y + y - 6,
        3, 3);
      bomb.fill = 'rgb(30, 30, 30)';
      bomb.stroke = 'rgb(30, 30, 30)';
      bomb.friction = 1;
      bomb.rotation = angle1;
      bomb.speed = power1 / 4;
    } else {
      let x = cos(angle2) * 16;
      let y = sin(angle2) * 16;

      bomb = new Sprite(
        tank2.position.x + x,
        tank2.position.y + y - 6,
        3, 3);
      bomb.fill = 'rgb(30, 30, 30)';
      bomb.stroke = 'rgb(30, 30, 30)';
      bomb.friction = 1;
      bomb.rotation = angle2;
      bomb.speed = power2 / 4;
    }
  }

  // Show Player Information
  showPlayerInfo()

  if (bomb != null) {
    if (bomb.collides(tank2)) {
      console.log('crashed')

      explode = new Sprite(tank2.position.x, tank2.position.y, 4, 'n');
      explode.fill = 'rgb(200, 30, 30)';
      explode.stroke = 'rgb(200, 30, 30)';
      box.text = 'win: Player 1';

      bomb.remove();
      bomb = null;
      return;
    }
    if (bomb.collides(tank1)) {
      console.log('crashed')

      explode = new Sprite(tank1.position.x, tank1.position.y, 4, 'n');
      explode.fill = 'rgb(200, 30, 30)';
      explode.stroke = 'rgb(200, 30, 30)';
      box.text = 'win: Player 2';

      bomb.remove();
      bomb = null;
      return;
    }

    if (bomb.collides(area)) {
      console.log('crashed - area');

      fire = false;
      turn = 1 - turn;

      explode = new Sprite(bomb.position.x, bomb.position.y, 4, 'n');
      explode.fill = 'rgb(200, 30, 30)';
      explode.stroke = 'rgb(200, 30, 30)';
      bomb.remove();
      bomb = null;
    }
  }
}

///////////////
// Functions //
///////////////

// show player info
function showPlayerInfo() {
  document.getElementById('player1').innerHTML = 'Player1 - Power: ' + power1 + '&emsp;Angle: ' + (angle1 - 180 <= 90 ? angle1 - 180 : 360 - angle1);
  document.getElementById('player2').innerHTML = 'Player2 - Power: ' + power2 + '&emsp;Angle: ' + (angle2 - 180 <= 90 ? angle2 - 180 : 360 - angle2);
  document.getElementById('turn').innerHTML = 'Turn: Player' + (turn + 1);
}

// Generate Polygon region
function createArea() {
  context = areaImage.canvas.getContext('2d');
  board = [];
  for (var i = 0; i < areaImage.height; i++) {
    var data = [];
    for (var j = 0; j < areaImage.width; j++) {
      data.push(context.getImageData(j, i, 1, 1).data[3] > 0 ? 1 : 0);
    }
    board.push(data);
  }
  var sp = [];
  for (var j = 0; j < areaImage.width; j++) {
    var flag = false;
    for (var i = 0; i < areaImage.height; i++) {
      if (board[i][j] == 1) {
        flag = true;
        sp.push([j, i]);
        break;
      }
    }
    if (flag == false) {
      sp.push([j, areaImage.height - 1]);
    }
  }
  sp.push([600, 400])
  sp.push([0, 400])
  area = new Sprite(sp, 's')
  area.fill = 'rgb(180, 97, 0)';
  area.stroke = 'rgb(180, 97, 0)';

  if (areaBg != null) {
    areaBg.remove();
    areaBg = null;
  }
  areaBg = new Sprite(300, 200, 600, 400, 'n');
  areaBg.addImage(areaImage);
  areaBg.layer = 1;
}

// When the bomb explodes, subtract bomb region from the background
function subtractExplodedRegion() {
  area.remove();

  context = areaImage.canvas.getContext('2d');

  for (var i = -explodeRadius; i <= explodeRadius; i++) {
    for (var j = -explodeRadius; j <= explodeRadius; j++) {
      if (i * i + j * j <= explodeRadius * explodeRadius) {
        context.clearRect(explode.position.x + i, explode.position.y + j, 1, 1)
      }
    }
  }

  var x = Math.floor(explode.position.x);
  var y = Math.floor(explode.position.y + 1);
  for (var i = -explodeRadius; i <= explodeRadius; i++) {
    for (var j = 0; j <= explodeRadius + 2; j++) {
      var y_Top = y - j;
      if (y_Top < 0) break;

      if (context.getImageData(x + i, y_Top, 1, 1).data[3] > 0) {

        var y_Below = Math.min(y + j, 400) - y;
        var h = j + y_Below;

        var k;
        for (k = y_Top; k >= 0; k--) {
          if (context.getImageData(x + i, k, 1, 1).data[3] > 0) {
            context.clearRect(x + i, k, 1, 1);
            context.fillStyle = 'rgb(180, 97, 0)';
            context.fillRect(x + i, k + h, 1, 1);
          }
        }

        break;
      }
    }
  }

  createArea();
}