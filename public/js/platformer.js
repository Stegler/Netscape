(function() {
  // module pattern

  //-------------------------------------------------------------------------
  // POLYFILLS
  //-------------------------------------------------------------------------

  if (!window.requestAnimationFrame) {
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimationFrame =
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback, element) {
        window.setTimeout(callback, 1000 / 60);
      };
  }

  //-------------------------------------------------------------------------
  // UTILITIES
  //-------------------------------------------------------------------------

  function timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
  }

  function bound(x, min, max) {
    return Math.max(min, Math.min(max, x));
  }

  function get(url, onsuccess) {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200) onsuccess(request);
    };
    request.open('GET', url, true);
    request.send();
  }

  function overlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(x1 + w1 - 1 < x2 || x2 + w2 - 1 < x1 || y1 + h1 - 1 < y2 || y2 + h2 - 1 < y1);
  }

  //-------------------------------------------------------------------------
  // GAME CONSTANTS AND VARIABLES
  //-------------------------------------------------------------------------

  const MAP = { tw: 64, th: 48 };
  let TILE = 32;
  let METER = TILE;
  let GRAVITY = 9.8 * 6; // default (exagerated) gravity
  let MAXDX = 15; // default max horizontal speed (15 tiles per second)
  let MAXDY = 60; // default max vertical speed   (60 tiles per second)
  let ACCEL = 1 / 2; // default take 1/2 second to reach maxdx (horizontal acceleration)
  let FRICTION = 1 / 6; // default take 1/6 second to stop from maxdx (horizontal friction)
  let IMPULSE = 1500; // default player jump impulse
  let COLOR = {
    BLACK: '#000000',
    YELLOW: '#ECD078',
    BRICK: '#D95B43',
    PINK: '#C02942',
    PURPLE: '#542437',
    GREY: '#333',
    SLATE: '#53777A',
    GOLD: 'gold'
  };
  let COLORS = [COLOR.YELLOW, COLOR.BRICK, COLOR.PINK, COLOR.PURPLE, COLOR.GREY];
  let KEY = {
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
  };

  const fps = 60;
  let step = 1 / fps;
  let canvas = document.getElementById('canvas');
  let ctx = canvas.getContext('2d');
  let width = (canvas.width = MAP.tw * TILE);
  let height = (canvas.height = MAP.th * TILE);
  let player = {};
  let monsters = [];
  let treasure = [];
  let cells = [];

  let t2p = function(t) {
    return t * TILE;
  };
  let p2t = function(p) {
    return Math.floor(p / TILE);
  };
  let cell = function(x, y) {
    return tcell(p2t(x), p2t(y));
  };
  var tcell = function(tx, ty) {
    return cells[tx + ty * MAP.tw];
  };

  //-------------------------------------------------------------------------
  // UPDATE LOOP
  //-------------------------------------------------------------------------

  function onkey(ev, key, down) {
    switch (key) {
      case KEY.LEFT:
        player.left = down;
        ev.preventDefault();
        return false;
      case KEY.RIGHT:
        player.right = down;
        ev.preventDefault();
        return false;
      case KEY.SPACE:
        player.jump = down;
        ev.preventDefault();
        return false;
    }
  }

  function update(dt) {
    updatePlayer(dt);
    updateMonsters(dt);
    checkTreasure();
  }

  function updatePlayer(dt) {
    updateEntity(player, dt);
  }

  function updateMonsters(dt) {
    let n;
    let max;
    for (n = 0, max = monsters.length; n < max; n++) updateMonster(monsters[n], dt);
  }

  function updateMonster(monster, dt) {
    if (!monster.dead) {
      updateEntity(monster, dt);
      if (overlap(player.x, player.y, TILE, TILE, monster.x, monster.y, TILE, TILE)) {
        if (player.dy > 0 && monster.y - player.y > TILE / 2) killMonster(monster);
        else killPlayer(player);
      }
    }
  }

  function checkTreasure() {
    let n;
    let max;
    let t;
    for (n = 0, max = treasure.length; n < max; n++) {
      t = treasure[n];
      if (!t.collected && overlap(player.x, player.y, TILE, TILE, t.x, t.y, TILE, TILE)) collectTreasure(t);
    }
  }

  function killMonster(monster) {
    player.killed++;
    monster.dead = true;
  }

  function killPlayer(player) {
    player.x = player.start.x;
    player.y = player.start.y;
    player.dx = player.dy = 0;
  }

  function collectTreasure(t) {
    player.collected++;
    t.collected = true;
    console.log(player.collected);
    // treasure.length
    if (player.collected == 1) {
      //alert('YOU WIN');
      get('/win', function() {
        console.log('next level...');
        location.reload();
      });
    }
  }

  function updateEntity(entity, dt) {
    const wasleft = entity.dx < 0;
    let wasright = entity.dx > 0;
    let { falling } = entity;
    let friction = entity.friction * (falling ? 0.5 : 1);
    let accel = entity.accel * (falling ? 0.5 : 1);

    entity.ddx = 0;
    entity.ddy = entity.gravity;

    if (entity.left) entity.ddx -= accel;
    else if (wasleft) entity.ddx += friction;

    if (entity.right) entity.ddx += accel;
    else if (wasright) entity.ddx -= friction;

    if (entity.jump && !entity.jumping && !falling) {
      entity.ddy -= entity.impulse; // an instant big force impulse
      entity.jumping = true;
    }

    entity.x += dt * entity.dx;
    entity.y += dt * entity.dy;
    entity.dx = bound(entity.dx + dt * entity.ddx, -entity.maxdx, entity.maxdx);
    entity.dy = bound(entity.dy + dt * entity.ddy, -entity.maxdy, entity.maxdy);

    if ((wasleft && entity.dx > 0) || (wasright && entity.dx < 0)) {
      entity.dx = 0; // clamp at zero to prevent friction from making us jiggle side to side
    }

    const tx = p2t(entity.x);
    let ty = p2t(entity.y);
    let nx = entity.x % TILE;
    let ny = entity.y % TILE;
    let cell = tcell(tx, ty);
    let cellright = tcell(tx + 1, ty);
    let celldown = tcell(tx, ty + 1);
    let celldiag = tcell(tx + 1, ty + 1);

    if (entity.dy > 0) {
      if ((celldown && !cell) || (celldiag && !cellright && nx)) {
        entity.y = t2p(ty);
        entity.dy = 0;
        entity.falling = false;
        entity.jumping = false;
        ny = 0;
      }
    } else if (entity.dy < 0) {
      if ((cell && !celldown) || (cellright && !celldiag && nx)) {
        entity.y = t2p(ty + 1);
        entity.dy = 0;
        cell = celldown;
        cellright = celldiag;
        ny = 0;
      }
    }

    if (entity.dx > 0) {
      if ((cellright && !cell) || (celldiag && !celldown && ny)) {
        entity.x = t2p(tx);
        entity.dx = 0;
      }
    } else if (entity.dx < 0) {
      if ((cell && !cellright) || (celldown && !celldiag && ny)) {
        entity.x = t2p(tx + 1);
        entity.dx = 0;
      }
    }

    if (entity.monster) {
      if (entity.left && (cell || !celldown)) {
        entity.left = false;
        entity.right = true;
      } else if (entity.right && (cellright || !celldiag)) {
        entity.right = false;
        entity.left = true;
      }
    }

    entity.falling = !(celldown || (nx && celldiag));
  }

  //-------------------------------------------------------------------------
  // RENDERING
  //-------------------------------------------------------------------------

  function render(ctx, frame, dt) {
    ctx.clearRect(0, 0, width, height);
    renderMap(ctx);
    renderTreasure(ctx, frame);
    renderPlayer(ctx, dt);
    renderMonsters(ctx, dt);
    console.log(60 - setTimeout(60000));
  }

  function renderMap(ctx) {
    let x;
    let y;
    let cell;
    for (y = 0; y < MAP.th; y++) {
      for (x = 0; x < MAP.tw; x++) {
        cell = tcell(x, y);
        if (cell) {
          ctx.fillStyle = COLORS[cell - 1];
          ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        }
      }
    }
  }

  function renderPlayer(ctx, dt) {
    ctx.fillStyle = COLOR.YELLOW;
    ctx.fillRect(player.x + player.dx * dt, player.y + player.dy * dt, TILE, TILE);

    let n;
    let max;

    ctx.fillStyle = COLOR.GOLD;
    for (n = 0, max = player.collected; n < max; n++) ctx.fillRect(t2p(2 + n), t2p(2), TILE / 2, TILE / 2);

    ctx.fillStyle = COLOR.SLATE;
    for (n = 0, max = player.killed; n < max; n++) ctx.fillRect(t2p(2 + n), t2p(3), TILE / 2, TILE / 2);
  }

  function renderMonsters(ctx, dt) {
    ctx.fillStyle = COLOR.SLATE;
    let n;
    let max;
    let monster;
    for (n = 0, max = monsters.length; n < max; n++) {
      monster = monsters[n];
      if (!monster.dead) ctx.fillRect(monster.x + monster.dx * dt, monster.y + monster.dy * dt, TILE, TILE);
    }
  }

  function renderTreasure(ctx, frame) {
    ctx.fillStyle = COLOR.GOLD;
    ctx.globalAlpha = 0.25 + tweenTreasure(frame, 60);
    let n;
    let max;
    let t;
    for (n = 0, max = treasure.length; n < max; n++) {
      t = treasure[n];
      if (!t.collected) ctx.fillRect(t.x, t.y + TILE / 3, TILE, (TILE * 2) / 3);
    }
    ctx.globalAlpha = 1;
  }

  function tweenTreasure(frame, duration) {
    const half = duration / 2;
    pulse = frame % duration;
    return pulse < half ? pulse / half : 1 - (pulse - half) / half;
  }

  //-------------------------------------------------------------------------
  // LOAD THE MAP
  //-------------------------------------------------------------------------

  function setup(map) {
    const { data } = map.layers[0];
    let { objects } = map.layers[1];
    let n;
    let obj;
    let entity;

    for (n = 0; n < objects.length; n++) {
      obj = objects[n];
      entity = setupEntity(obj);
      switch (obj.type) {
        case 'player':
          player = entity;
          break;
        case 'monster':
          monsters.push(entity);
          break;
        case 'treasure':
          treasure.push(entity);
          break;
      }
    }

    cells = data;
  }

  function setupEntity(obj) {
    const entity = {};
    entity.x = obj.x;
    entity.y = obj.y;
    entity.dx = 0;
    entity.dy = 0;
    entity.gravity = METER * (obj.properties.gravity || GRAVITY);
    entity.maxdx = METER * (obj.properties.maxdx || MAXDX);
    entity.maxdy = METER * (obj.properties.maxdy || MAXDY);
    entity.impulse = METER * (obj.properties.impulse || IMPULSE);
    entity.accel = entity.maxdx / (obj.properties.accel || ACCEL);
    entity.friction = entity.maxdx / (obj.properties.friction || FRICTION);
    entity.monster = obj.type == 'monster';
    entity.player = obj.type == 'player';
    entity.treasure = obj.type == 'treasure';
    entity.left = obj.properties.left;
    entity.right = obj.properties.right;
    entity.start = { x: obj.x, y: obj.y };
    entity.killed = entity.collected = 0;
    return entity;
  }

  //-------------------------------------------------------------------------
  // THE GAME LOOP
  //-------------------------------------------------------------------------

  let counter = 0;
  let dt = 0;
  let now;
  let last = timestamp();
  // // let fpsmeter = new FPSMeter({ --EK
  //   decimals: 0,
  //   graph: true,
  //   theme: 'dark',
  //   left: '5px'
  // });

  function frame() {
    // fpsmeter.tickStart();--EK
    now = timestamp();
    dt += Math.min(1, (now - last) / 1000);
    while (dt > step) {
      dt -= step;
      update(step);
    }
    render(ctx, counter, dt);
    last = now;
    counter++;
    // fpsmeter.tick();--EK
    requestAnimationFrame(frame, canvas);
  }

  document.addEventListener('keydown', ev => onkey(ev, ev.keyCode, true), false);
  document.addEventListener('keyup', ev => onkey(ev, ev.keyCode, false), false);

  get('mylevel.json', req => {
    setup(JSON.parse(req.responseText));
    frame();
  });
})();
