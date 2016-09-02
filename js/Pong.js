// Copyright goes to Pong
// Made By Pie

var WIDTH = 800, HEIGHT = 600, pi = Math.PI;
var UpArrow = 38, DownArrow = 40, speed = 7;
var canvas, ctx, keystate;
var player, ai, ball;
var score = {
  player: 0,
  ai: 0
};

player = {
  x: null,
  y: null,
  width: 20,
  height: 100,

  update: function() {
    if (keystate[UpArrow]) this.y -= speed;
    if (keystate[DownArrow]) this.y += speed;
    if (player.y <= 0) {
      player.y = 0;
    }
    if (player.y + player.height >= HEIGHT) {
      player.y = HEIGHT - player.height;
    }
  },
  draw: function() {
      ctx.fillRect(this.x, this.y, this.width, this.height);
  }
};

ai = {
  x: null,
  y: null,
  width: 20,
  height: 100,

  update: function() {
    var desty = ball.y - (this.height - ball.side) * 0.5;
    this.y += (desty - this.y) * 0.15;
    if (ai.y <= 0) {
      ai.y = 0;
    }
    if (ai.y + ai.height >= HEIGHT) {
      ai.y = HEIGHT - ai.height;
    }
  },
  draw: function() {
      ctx.fillRect(this.x, this.y, this.width, this.height);
  }
};

ball = {
  x: null,
  y: null,
  side: 20,
  vel: null,
  speed: 8,

  serve: function(side) {
      var r = Math.random();
      this.x = side === 1 ? player.x + 100 : ai.x - (this.side + 100);
      this.y = (HEIGHT - this.side) * r;

      var phi = 0.1 * pi * (1 - 2 * r);
      this.vel = {
        x: side * this.speed * Math.cos(phi),
        y: this.speed * Math.sin(phi)
      }
  },

  update: function() {
    this.x += this.vel.x;
    this.y += this.vel.y;

    if (0 > this.y || this.y + this.side > HEIGHT) {
      var offset = this.vel.y < 0 ? 0 - this.y : HEIGHT - (this.y + this.side);
      this.y += 2 * offset;
      this.vel.y *= -1;
    }

    var AABBIntersect = function(ax, ay, aw, ah, bx, by, bw, bh) {
      return ax < bx + bw && ay < by + bh && bx < ax + aw && by < ay + ah;
    };

    var pdle = this.vel.x < 0 ? player : ai;
    if (AABBIntersect(pdle.x, pdle.y, pdle.width, pdle.height, this.x, this.y, this.side, this.side)) {
      this.x = pdle === player ? player.x + player.width : ai.x - this.side;

      var n = (this.y + this.side - pdle.y) / (pdle.height + this.side);
      var phi = 0.25 * pi * (2 * n - 1); // pi/4 = 45

      var smash = Math.abs(phi) > 0.2 * pi ? 1.5 : 1;
      this.vel.x = smash * (pdle === player ? 1 : -1) * this.speed * Math.cos(phi);
      this.vel.y = smash * this.speed * Math.sin(phi);

      this.speed += 0.75;
    }

    // Score / Serve
    if (0 > this.x + this.side || this.x > WIDTH) {
        this.speed = 9;
        if (0 > this.x + this.side) {
          score.ai += 1;
        }
        if (this.x > WIDTH) {
          score.player += 1;
        }

        this.serve(pdle === player ? 1 : -1);
    }


  },
  draw: function() {
      ctx.fillRect(this.x, this.y, this.side, this.side);
  }
};

function main() {
  canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  ctx = canvas.getContext("2d");
  document.body.appendChild(canvas);

  keystate = {};
  document.addEventListener("keydown", function(evt) {
    keystate[evt.keyCode] = true;
  });
  document.addEventListener("keyup", function(evt) {
    delete keystate[evt.keyCode];
  });

  init();

  var loop = function() {
    update();
    draw();

    window.requestAnimationFrame(loop, canvas);
  }
  window.requestAnimationFrame(loop, canvas);
}

function init() {
  player.x = player.width;
  player.y = (HEIGHT - player.height) / 2;

  ai.x = WIDTH - (player.width + ai.width);
  ai.y = (HEIGHT - ai.height) / 2;

  ball.serve(1);
}

function update() {
  ball.update();
  player.update();
  ai.update();
}

function draw() {
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  ctx.fillStyle = "#fff";

  ball.draw();
  player.draw();
  ai.draw();

  var w = 4;
  var x = (WIDTH - w) * 0.5;
  var y = 0;
  var step = HEIGHT / 15;
  while (y < HEIGHT) {
    ctx.fillRect(x, y + step * 0.25, w, step * 0.5);
    y += step;
  }


  // Draw Score
  ctx.font = "75px Georgia";
  ctx.fillText(score.player.toString(), x - (WIDTH / 4), 70);
  ctx.fillText(score.ai.toString(), x + (WIDTH / 4), 70);

  ctx.restore();
}

main();
