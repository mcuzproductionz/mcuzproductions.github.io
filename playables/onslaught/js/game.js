(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';


var Huds = function(game, levelData) {
	console.log('Huds');
	this.game = game;
	this.levelData = levelData;
	Phaser.Group.call(this, this.game, 'Huds', false, true, Phaser.Physics.ARCADE);
	this.game.add.existing(this);

	// fonts
	this.scoreText = this.game.add.bitmapText(5, 5, 'score', 'score', 18);
	this.scoreText.text = "SCORE:00000000";
	this.livesText = this.game.add.bitmapText(520, 5, 'score', 'lives', 18);
	this.livesText.text = "LIVES:" + this.levelData.lives;
	this.levelText = this.game.add.bitmapText(330, 5, 'score', 'level', 18);
	this.levelText.text = "LEVEL:" + this.levelData.level;
	this.addScore(0);

};


Huds.prototype = Object.create(Phaser.Group.prototype);
Huds.prototype.constructor = Huds;
Huds.prototype.addScore = function(points){
	this.levelData.score += points;
	var score = '' + this.levelData.score;
	if (score.length < 8){
		  var l = 8 - score.length;
			for(var i = 0; i < l; i++){
				score = '0' + score;
			}
	}
	this.scoreText.text = 'SCORE:' + score;
};

Huds.prototype.decLives = function(){
	this.levelData.lives = this.levelData.lives - 1;
	this.livesText.text = 'LIVES:' + this.levelData.lives;
};

Huds.prototype.showLives = function(){
	this.livesText.text = 'LIVES:' + this.levelData.lives;
};

Huds.prototype.update = function() {


};

module.exports = Huds;

},{}],2:[function(require,module,exports){
'use strict';

var Sound = function(game, state){
  this.game = game;
  this.state = state;
  this.explosionsfx = this.game.add.audio('explosionsfx');
  this.lasersfx = this.game.add.audio('lasersfx');
  this.hurtsfx = this.game.add.audio('hurtsfx');
  this.mothershipkillsfx = this.game.add.audio('mothershipkillsfx');
  this.mothershipfiresfx = this.game.add.audio('mothershipfiresfx');
  this.divesfx = this.game.add.audio('divesfx');
  this.hitsfx = this.game.add.audio('hitsfx');
};


Sound.prototype = Object;
Sound.prototype.constructor = Sound;

Sound.prototype.play = function(sname){
  console.log(sname);
  switch(sname){
    case 'divesfx':
      this.divesfx.play();
      break;
    case 'explosionsfx':
      this.explosionsfx.stop();
      this.explosionsfx.play();
      break;
    case 'lasersfx':
      this.lasersfx.stop();
      this.lasersfx.play();
      break;
    case 'hurtsfx':
      this.hurtsfx.play();
      break;
    case 'mothershipkillsfx':
      this.mothershipkillsfx.play();
      break;
    case 'mothershipfiresfx':
      this.mothershipfiresfx.play();
      break;
    case 'hitsfx':
      this.hitsfx.play();
      break;
  }

};



module.exports = Sound;

},{}],3:[function(require,module,exports){
'use strict';

//global variables
window.onload = function () {
  var game = new Phaser.Game(700, 600, Phaser.AUTO, 'superzapper');

  // Game States
  game.state.add('attract', require('./states/attract'));
  game.state.add('begin', require('./states/begin'));
  game.state.add('boot', require('./states/boot'));
  game.state.add('gameover', require('./states/gameover'));
  game.state.add('nextlevel', require('./states/nextlevel'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));
  

  game.state.start('boot');
};
},{"./states/attract":15,"./states/begin":16,"./states/boot":17,"./states/gameover":18,"./states/nextlevel":19,"./states/play":20,"./states/preload":21}],4:[function(require,module,exports){
'use strict';

var Alien = function(game, x, y, type, xoffset, state) {
  this.game = game;
  this.state = state;
  this.TAG = 'Alien ';
  console.log(this.TAG + ' constructor');
  Phaser.Sprite.call(this, game, x, y, 'alien'+type, 0);
  this.speed = this.game.rnd.integerInRange(1,3) * 10;
  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.xmax = x + xoffset; this.xmin = (this.width) + x - xoffset;
  this.anchor.setTo(0.5, 0.5);
  this.health = 5 - type;
  this.angle = 90;
  this.speed = 50;
  this.score = type * 75;
  this.body.velocity.x = this.speed;
  this.game.add.existing(this);
  this.LEFT = 0; this.RIGHT = 1; this.down = 2;
  this.PACK = 0; this.FLIGHT = 1; this.FLYING = 2;
  this.dir = this.RIGHT;
  this.mode = this.PACK;
  this.AI = [this.packMove, this.flightMove, this.flying];
};

Alien.prototype = Object.create(Phaser.Sprite.prototype);
Alien.prototype.constructor = Alien;

Alien.prototype.update = function() {
  if (typeof this.AI[this.mode] === "function"){
    this.AI[this.mode](this);
  }
},

Alien.prototype.flying = function(s){
  if (s.x < -s.width/2){
    s.x = 699 + s.width/2;
  }
  if (s.x > 700 + s.width/2){
    s.x = 1 - (s.width/2);
  }
  if (s.y > 600){
    s.y = 1 - s.height;
    s.x = s.game.rnd.integerInRange(50, 650);
    s.game.physics.arcade.velocityFromAngle(s.game.rnd.integerInRange(45, 135), s.state.levelData.alienFlightDescent, s.body.velocity);
  }
},

Alien.prototype.flyChange = function(){

},

Alien.prototype.flightMove = function(s){
  console.log(s.TAG+'flightMove');
  s.game.physics.arcade.velocityFromAngle(s.game.rnd.integerInRange(45, 135), 200, s.body.velocity);
  s.mode = s.FLYING;
},

Alien.prototype.packMove = function(s){
  switch(s.dir){
    case s.RIGHT:
      if (s.x > s.xmax) {
        s.x = s.xmax; s.body.velocity.x = 0;
        s.body.velocity.y = s.speed;
        s.dy = s.y + 30; s.nextDir = s.LEFT;
        s.dir = s.DOWN;
      }
      break;
    case s.LEFT:
      if (s.x < s.xmin){
        s.x = s.xmin; s.body.velocity.x = 0;
        s.body.velocity.y = s.speed;
        s.dy = s.y + 30; s.nextDir = s.RIGHT;
        s.dir = s.DOWN;
      }
      break;
    case s.DOWN:
      if (s.y >= s.dy){
        s.y = s.dy;
        s.body.velocity.y = 0;
        s.dir = s.nextDir;
        s.body.velocity.x = (s.dir == s.LEFT ? -s.speed : s.speed);
      }
      break;
  }
  if (s.y + (s.height/2) > 600){
    s.y = s.y - 600;
  }

};

module.exports = Alien;

},{}],5:[function(require,module,exports){
'use strict';

var AlienShot = function(game, state) {
  this.TAG = "AlienShot ";
  console.log(this.TAG+'constructor');
  this.game = game;
  this.state = state;
  Phaser.Group.call(this, this.game, 'alienshot', false, true, Phaser.Physics.ARCADE);
  this.game.add.existing(this);
  //this.speed = 200;

  // AlienShots
  this.createMultiple(20, 'alienshot', 0, true);
  this.setAll('alive', false); this.setAll('visible', false);
  this.setAll('checkWorldBounds', true);
  this.setAll('outOfBoundsKill', true);
  this.setAll('anchor.x', 0.5); this.setAll('anchor.y', 0.5);

};

AlienShot.prototype = Object.create(Phaser.Group.prototype);
AlienShot.prototype.constructor = AlienShot;

AlienShot.prototype.killAllShots = function(){
	this.forEachAlive(
		function(s){
			this.state.explosion.make(s.x, s.y);
			s.kill();
		},
		this
	);
}

AlienShot.prototype.hit = function(alienShot, enemy){
  alienShot.kill();
  enemy.health = enemy.health - 1;
  if (enemy.health <= 0) { return true; } else {
    return false;
  }
};

AlienShot.prototype.death = function(alienShot, enemy){
  console.log(this.TAG+'collisionHandler');
  enemy.kill();
  this.sound.play('hurtsfx');
};

AlienShot.prototype.fire = function(fx, fy, speed, angle, color){
  var AlienShot = this.getFirstDead();
  if (AlienShot == null) return;
  AlienShot.reset(fx, fy);
  AlienShot.angle = angle;
  this.game.physics.enable(AlienShot, Phaser.Physics.ARCADE);
  AlienShot.frame = 0;
  AlienShot.tint = color;
  AlienShot.visible = true;
  AlienShot.body.velocity = this.game.physics.arcade.velocityFromAngle(AlienShot.angle, this.state.levelData.alienFireSpeed);
  if (this.state.levelData.alienFireSide) AlienShot.body.velocity.x += this.game.rnd.integerInRange(-50, 50);
};


AlienShot.prototype.update = function() {
};

module.exports = AlienShot;

},{}],6:[function(require,module,exports){
'use strict';

var Alien = require('../prefabs/Alien.js');

var Aliens = function(game, state) {
	this.game = game;
	this.state = state;
  Phaser.Group.call(this, this.game, 'aliens', false, true, Phaser.Physics.ARCADE);
  this.game.add.existing(this);


	// add pack aliens
	var xoffset = (700 - (7 * 58))/2;
	var yoffset = 50;
	for(var p = 0; p <= 4; p++){
		for(var i = 0; i < 7; i++){
			var s = new Alien(this.game, xoffset + (i * 58), yoffset + (p * 58), this.state.levelData.alist[p], xoffset, this.state);
			s.fireSpeed = p < 2 ? 300 : 200;
			this.add(s);
		}
	}

	this.maxAliens = this.countLiving();

	this.shotTimer = this.game.time.events.add(400 + this.game.rnd.integerInRange(0, this.state.levelData.alienFireRate), this.fire, this);
	this.flightTimer = this.game.time.events.add(6000, this.flight, this);
};

Aliens.prototype = Object.create(Phaser.Group.prototype);
Aliens.prototype.constructor = Aliens;

Aliens.prototype.killFlyingAliens = function(){
	this.forEachAlive(
		function(s){
			if (s.mode == s.FLYING && s.alive){
				this.state.explosion.make(s.x, s.y);
				s.kill();
			}
		},
		this
	);
},

Aliens.prototype.flight = function(){
	var s = Phaser.Math.getRandom(this.children.filter(function(e){
		return (e.alive && e.mode == e.PACK);
	}));
	if (s == null) return;  // no more pack moving aliens, no need to renew timer
	s.mode = s.FLIGHT;
	this.state.sound.play('divesfx');
	this.flightTimer = this.game.time.events.add(6000, this.flight, this);
},

Aliens.prototype.fire = function(){
	var threshold = (this.countLiving()/this.maxAliens) * 100;

	var no = this.game.rnd.integerInRange(1, 3);
	for(var i = 0; i < no; i++){
		var s = Phaser.Math.getRandom(this.children.filter(function(e) {
		  return e.alive;
		}));
		if (s != null){
			this.alienShot.fire(s.x, s.y, s.fireSpeed, 90, 0xff00ff);
		}
	}

	this.shotTimer = this.game.time.events.add(400 + this.game.rnd.integerInRange(0, this.state.levelData.alienFireRate), this.fire, this);
};

Aliens.prototype.update = function() {
	this.callAll('update');
};

module.exports = Aliens;

},{"../prefabs/Alien.js":4}],7:[function(require,module,exports){
'use strict';

var ExplosionGenerator = function(game, state){
  this.TAG = 'ExplosionGenerator ';
  console.log(this.TAG+'constructor');
  this.game = game;
  this.state = state;
  Phaser.Group.call(this, this.game, 'ExplosionGenerator', false, true, Phaser.Physics.ARCADE);
  this.game.add.existing(this);
  this.createMultiple(20, 'explosion', 0, true);
  this.setAll('alive', false); this.setAll('visible', false);
  this.setAll('anchor.x', 0.5); this.setAll('anchor.y', 0.5);

  //console.log(this.TAG+this.countDead());

};

ExplosionGenerator.prototype = Object.create(Phaser.Group.prototype);
ExplosionGenerator.prototype.constructor = ExplosionGenerator;


ExplosionGenerator.prototype.make = function(fx, fy){
  console.log(this.TAG+' make');
  var s = this.getFirstDead();
  if (s == null) return;
  s.reset(fx, fy);
  if (s.anim == null){
    console.log(this.TAG+'animations add');
    s.anim = s.animations.add('exp', [0,1,0,1,2,3,4,5], 10, false);
    s.anim.killOnComplete = true;
  }
  s.anim.play();
  this.state.sound.play('explosionsfx');
};


module.exports = ExplosionGenerator;

},{}],8:[function(require,module,exports){
'use strict';

var MotherShip = function(game, state) {
  this.TAG = 'MotherShip ';
  console.log(this.TAG+'constructor');
  this.game = game; this.state = state;
  Phaser.Sprite.call(this, game, 50, 150, 'mothership', 0);
  this.game.add.existing(this);
  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.animations.add('rotate', [0,1,2,3], 30, true);
  this.checkWorldBounds = true; this.outOfBoundsKill = true;
  this.smoothed = false; this.speed = 200;
	this.anchor.setTo(0.5, 0.5);
  this.events.onKilled.add(this.dead, this);
  this.kill();
  this.fireSpeed = 260;
};

MotherShip.prototype = Object.create(Phaser.Sprite.prototype);
MotherShip.prototype.constructor = MotherShip;

MotherShip.prototype.dead = function(){
  // respawn
  this.startTimer = this.game.time.events.add(8000, this.init, this);
};

MotherShip.prototype.death = function(s, shot){
  s.state.pickup.init(s.x, s.y);
  shot.kill();
  //s.state.explosion.make(s.x, s.y);
  s.state.huds.addScore(s.score);
  console.log(s.score);
  s.state.score.make(s.x, s.y, String(s.score));
  s.kill();
  this.sound.play('mothershipkillsfx');
};

MotherShip.prototype.init = function(){
  console.log(this.TAG + 'init');
  this.reset(0, 35);
  this.score = this.game.rnd.integerInRange(1,4) * 250;
  this.visible = true;
  this.animations.play('rotate');
  if (Phaser.Utils.randomChoice(true, false)){
    this.x = 0; this.body.velocity.x = this.speed;
  } else {
    this.x = 700; this.body.velocity.x = -this.speed;
  }
  this.fireTimer = this.game.time.events.add(this.game.rnd.integerInRange(100, this.state.levelData.mothershipFireTimer), this.fire, this);
};

MotherShip.prototype.fire = function(){
  if (!this.alive) return;
  this.state.alienShot.fire(this.x, this.y, this.fireSpeed + this.game.rnd.integerInRange(0, 100),
    Phaser.Math.radToDeg(this.game.physics.arcade.angleBetween(this, this.state.ship)),
     0xff5555);
  this.state.sound.play('mothershipfiresfx');
  this.fireTimer = this.game.time.events.add(this.game.rnd.integerInRange(100, this.state.levelData.mothershipFireTimer), this.fire, this);
};

MotherShip.prototype.update = function() {

  // write your prefab's specific update code here

};

module.exports = MotherShip;

},{}],9:[function(require,module,exports){
'use strict';

var Pickup = function(game, state) {
  this.TAG = 'Pickup ';
  console.log(this.TAG+'constructor');
  this.game = game; this.state = state;
  Phaser.Sprite.call(this, game, 50, 150, 'pickup', 0);
  this.game.add.existing(this);
  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.checkWorldBounds = true; this.outOfBoundsKill = true;
  this.smoothed = false; this.speed = 200;
	this.anchor.setTo(0.5, 0.5);
  this.events.onKilled.add(this.dead, this);
  this.kill();
};

Pickup.prototype = Object.create(Phaser.Sprite.prototype);
Pickup.prototype.constructor = Pickup;

Pickup.prototype.dead = function(){
};

Pickup.prototype.init = function(fx, fy){
  if (this.alive) return;
  console.log(this.TAG + 'init');
  this.reset(fx, fy);
  this.visible = true;
  this.body.velocity.y = this.speed;

  if (Phaser.Math.chanceRoll(10)){
    this.frame = 4;
  } else if (Phaser.Math.chanceRoll(20)){
    this.frame = 3;
  } else if (Phaser.Math.chanceRoll(20)){
    this.frame = 2;
  } else if (Phaser.Math.chanceRoll(20)){
    this.frame = 1;
  } else {
    this.frame = 0;
  }

};


Pickup.prototype.update = function() {
};

module.exports = Pickup;

},{}],10:[function(require,module,exports){
'use strict';

var Score = function(game){
  this.TAG = 'Score ';
  console.log(this.TAG+'constructor');
  this.game = game;
  Phaser.Group.call(this, this.game, 'score', false, true, Phaser.Physics.ARCADE);
  this.game.add.existing(this);
  this.createMultiple(10, 'bonus', 0, true);
  this.setAll('alive', false); this.setAll('visible', false);
  this.setAll('anchor.x', 0.5); this.setAll('anchor.y', 0.5);
  this.forEach(function(s){
    s.animations.add('1000', [15,16,17,18,19,15,16,17,18,19], 10, false);
    s.animations.add('500',  [10,11,12,13,14,10,11,12,13,14], 10, false);
    s.animations.add('750',  [5,6,7,8,9,5,6,7,8,9], 10, false);
    s.animations.add('250',  [0,1,2,3,4,0,1,2,3,4], 10, false);
  }, this);
};



Score.prototype = Object.create(Phaser.Group.prototype);
Score.prototype.constructor = Score;
Score.prototype.make = function(fx, fy, type){
  console.log(this.TAG+' make ');
  var s = this.getFirstDead();
  if (s == null) return;
  s.reset(fx, fy);
  var anim = s.animations.getAnimation(type);
  anim.killOnComplete = true;
  anim.play();

};

module.exports = Score;

},{}],11:[function(require,module,exports){
'use strict';

var Shot = require('../prefabs/Shot.js');

var Ship = function(game, state) {
	this.TAG='Ship ';
	console.log(this.TAG+'constructor');
	this.game = game;
	this.state = state;
	Phaser.Sprite.call(this, game, 350, 550, 'ship', 0);
	this.game.physics.enable(this, Phaser.Physics.ARCADE);
	this.smoothed = false;
	this.game.add.existing(this);
	this.anchor.setTo(0.5, 0.5);
	this.xmax = 700 - this.width/2;
	this.xmin = this.width/2;
	this.ymax = 600 - this.height/2;
	this.ymin = this.height/2;
	this.scale.setTo(0.75, 0.75);
	this.speed = 300;
	this.cursors = this.game.input.keyboard.createCursorKeys();
  this.shotTimer = this.game.time.events.loop(this.state.levelData.playerShotInterval, this.fire, this);
	this.fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
	this.SINGLE_FIRE = 1;
	this.DOUBLE_FIRE = 2;
	this.FAST_FIRE = 3;
	this.wMode = this.SINGLE_FIRE;
	this.shield = false;
	this.animations.add('flash', [0,1], 5, true);
};

Ship.prototype = Object.create(Phaser.Sprite.prototype);
Ship.prototype.constructor = Ship;


Ship.prototype.death = function(ship, enemy){
	if (!ship.alive) return;
	if (ship.shield) return;
	this.ship.kill();
	for(var ex = 0; ex < 3; ex++){
		for(var ey = 0; ey < 3; ey++){
			var sx = -ship.width + (ex * ship.width);
			var sy = -ship.height + (ey * ship.height);
			this.explosion.make(ship.x + sx, ship.y + sy);  this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.B);
  this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.M);
  this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.N);
  this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.H);
  this.fireKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);
		}
	}

  ship.game.time.events.remove(ship.shotTimer);
	if (ship.state.levelData.lives == 0) {  this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.B);
  this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.M);
  this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.N);
  this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.H);
  this.fireKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);
		ship.game.time.events.add(2000, ship.state.quit, ship.state);
	} else {
		ship.game.time.events.add(2000, ship.reSpawn, ship);
		ship.state.huds.decLives();
	}
};

Ship.prototype.setWeapon = function(wType){
	switch(wType){
		case this.FAST_FIRE:
			this.wMode = wType;
			this.game.time.events.remove(this.shotTimer);
			this.shotTimer = this.game.time.events.loop(this.state.levelData.playerShotInterval, this.fire, this);
			break;
		case this.DOUBLE_FIRE:
			this.wMode = wType;
			this.game.time.events.remove(this.shotTimer);
			this.shotTimer = this.game.time.events.loop(this.state.levelData.playerShotInterval, this.fire, this);
			break;
	}
};

Ship.prototype.reSpawn = function(){
	this.reset(350, 550);
	this.shotTimer = this.game.time.events.loop(this.state.levelData.playerShotInterval, this.fire, this);
  this.shield = true;
	this.animations.play('flash');
	this.game.time.events.add(2000, function(){
			this.shield = false;
			this.animations.stop('flash');
			this.frame = 0;
	}, this);
};

Ship.prototype.raiseShield = function(){
	this.shield = true;
	this.animations.play('flash');
	this.game.time.events.add(10000, function(){
		this.shield = false;
		this.animations.stop('flash');
		this.frame = 0;
	}, this);
};

Ship.prototype.fire = function(){
	console.log(this.TAG+'fire');
	if (this.fireButton.isDown){
		switch(this.wMode){
			case this.SINGLE_FIRE:
				this.shot.fire(this.x, this.y, 600, 0xCCCCCC);
				break;
			case this.DOUBLE_FIRE:
				this.shot.fire(this.x-10, this.y, 600, 0xff0000);
				this.shot.fire(this.x+10, this.y, 600, 0xff0000);
				break;
			case this.FAST_FIRE:
				this.shot.fire(this.x, this.y, 1200, 0x000ff00);
				break;
		}
	}
};

Ship.prototype.collisionCheck = function(){
	this.shots.collisionCheck();
};

Ship.prototype.update = function() {
	if (!this.alive) return;

	this.body.velocity.setTo(0, 0);

	if (this.cursors.right.isDown && this.x < this.xmax){
		this.body.velocity.x = this.speed;
	} else if (this.cursors.left.isDown && this.x > this.xmin) {
		this.body.velocity.x = -this.speed;
	}

	if (this.cursors.up.isDown && this.y > this.ymin){
		this.body.velocity.y = -this.speed;
	} else if (this.cursors.down.isDown && this.y < this.ymax) {
		this.body.velocity.y = this.speed;
	}

};

module.exports = Ship;

},{"../prefabs/Shot.js":12}],12:[function(require,module,exports){
'use strict';

var Shot = function(game, state) {
  this.TAG = "Shot ";
  console.log(this.TAG+'constructor');
  this.game = game;
  this.state = state;
  Phaser.Group.call(this, this.game, 'shot', false, true, Phaser.Physics.ARCADE);
  this.game.add.existing(this);
  this.speed = 600;

  // shots
  this.createMultiple(20, 'shot', 0, true);
  this.setAll('alive', false); this.setAll('visible', false);
  this.setAll('checkWorldBounds', true);
  this.setAll('outOfBoundsKill', true);
  this.setAll('anchor.x', 0.5); this.setAll('anchor.y', 0.5);
  //console.log(this.TAG + 'living = '+this.countLiving());
  //console.log(this.TAG + 'dead = '+this.countDead());

};

Shot.prototype = Object.create(Phaser.Group.prototype);
Shot.prototype.constructor = Shot;

Shot.prototype.hit = function(shot, enemy){
  shot.kill();
  enemy.health = enemy.health - 1;
  if (enemy.health <= 0) { return true; } else {
    this.sound.play('hitsfx');
    return false;
  }
};

Shot.prototype.death = function(shot, enemy){
  this.explosion.make(enemy.x, enemy.y);
  this.huds.addScore(enemy.score);
  enemy.kill();
};


Shot.prototype.fire = function(fx, fy, speed, color){
  var shot = this.getFirstDead();
  if (shot == null) return;
  this.state.sound.play('lasersfx');
  if (color != null) shot.tint = color;
  shot.reset(fx, fy);
  this.game.physics.enable(shot, Phaser.Physics.ARCADE);
  shot.frame = 0;
  shot.visible = true;
  shot.body.velocity.y = -speed;
};

Shot.prototype.update = function() {

};

module.exports = Shot;

},{}],13:[function(require,module,exports){
'use strict';

var Star = function(game, speed) {
  this.game = game;
  this.ymin = 10; this.ymax = 590;
  Phaser.Sprite.call(this, game, this.game.rnd.integerInRange(1, 700), this.game.rnd.integerInRange(this.ymin, this.ymax), 'stars', 0);
  this.speed = this.game.rnd.integerInRange(1,3) * 10;
  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.velocity.y = speed;

  var smax = this.game.rnd.integerInRange(2, 10);
  var frames = [];
  for(var i = 0; i < smax; i++){
    frames.push(this.game.rnd.integerInRange(0, 9));
  }
  var frameRate = this.game.rnd.integerInRange(10, 30);

  this.animations.add('starFlash', frames, frameRate, true);
  this.animations.play('starFlash');
  this.game.add.existing(this);
};

Star.prototype = Object.create(Phaser.Sprite.prototype);
Star.prototype.constructor = Star;

Star.prototype.update = function() {

	if (this.y > 700) {
		this.y = 0; 
	  this.x = this.game.rnd.integerInRange(1, 700);
 	}

};

module.exports = Star;

},{}],14:[function(require,module,exports){
'use strict';

var Star = require('../prefabs/Star.js');


var Stars = function(game) {
	this.game = game;
  Phaser.Group.call(this, this.game, 'Stars', false, true, Phaser.Physics.ARCADE);
  this.game.add.existing(this);
	var smax = 10;
	for(var i = 0; i < smax; i++){	var s = new Star(game, 20);	this.add(s);	}
	for(var i = 0; i < smax; i++){	var s = new Star(game, 50);	this.add(s);	}
	for(var i = 0; i < smax; i++){	var s = new Star(game, 75);	this.add(s);	}
	for(var i = 0; i < smax; i++){	var s = new Star(game, 100);	this.add(s);	}

};

Stars.prototype = Object.create(Phaser.Group.prototype);
Stars.prototype.constructor = Stars;

Stars.prototype.update = function() {

  // write your prefab's specific update code here
  this.callAll('update');

};

module.exports = Stars;

},{"../prefabs/Star.js":13}],15:[function(require,module,exports){
'use strict';

var Stars = require('../prefabs/Stars.js');
var ExplosionGenerator = require('../prefabs/ExplosionGenerator.js');
var Sound = require('../classes/Sound.js');

  function Attract() {}
  Attract.prototype = {
    preload: function() {
      console.log('attract state');

      // Override this method to add some load operations.
      // If you need to use the loader, you may need to use them here.
    },

    create: function() {
      // This method is called after the game engine successfully switches states.
      // Feel free to add any setup code here (do not load anything here, override preload() instead).
      this.game.stage.backgroundColor = '#000000';
      this.game.physics.startSystem(Phaser.Physics.ARCADE);
      this.stars = new Stars(this.game);
      this.onslaught = this.game.add.sprite(this.game.world.centerX, 175, 'onslaught');
      this.sound = new Sound(this.game, this);
      this.expGen = new ExplosionGenerator(this.game, this);
      this.game.physics.enable(this.onslaught, Phaser.Physics.ARCADE);
      this.onslaught.anchor.setTo(0.5, 0.5);
      this.onslaught.smoothed = false;

      this.oxMin = this.game.world.centerX - (this.onslaught.width/2);
      this.oxMax = this.game.world.centerX + (this.onslaught.width/2);
      this.oyMin = 175 - this.onslaught.height/2;
      this.oyMax = 175 + this.onslaught.height/2;

      this.onslaught.scale.setTo(0.1);
      var zoomInText = this.game.add.tween(this.onslaught.scale).to( { x: 1, y: 1 }, 2000, Phaser.Easing.Quadratic.Out, true);
      this.menuTimer = this.game.time.events.add(4000, this.displayMenu, this);
      zoomInText.onComplete.add(this.explode, this);



      this.aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);

    },

    flashText: function(){
      if (this.fText.visible){
        this.flashTextTimer = this.game.time.events.add(300, this.flashText, this);
      } else {
        this.flashTextTimer = this.game.time.events.add(1000, this.flashText, this);
      }
      this.fText.visible = !this.fText.visible;
    },

    displayMenu: function(){
      this.game.time.events.remove(this.expTimer);
      this.flashTextTimer = this.game.time.events.add(300, this.flashText, this);

      var textType = "16px Courier";

      var t1 = this.game.add.text(this.game.world.centerX, 260, 'Can you survive the Alien onslaught?',
        { font: textType, fill: "#f00", fontWeight: 'bold' });
      t1.anchor.setTo(0.5, 0.5);

      var t2 = this.game.add.text(this.game.world.centerX, 300, 'A key = Kill! Kill! Kill!',
        { font: textType, fill: "#09F", fontWeight: 'bold' });
      t2.anchor.setTo(0.5, 0.5);

      var t3 = this.game.add.text(this.game.world.centerX, 330, 'Arrow keys = Execute Maneuvers',
        { font: textType, fill: "#09F", fontWeight: 'bold' });
      t3.anchor.setTo(0.5, 0.5);

      this.fText = this.game.add.text(this.game.world.centerX, 370, 'Press A Key to start the action',
        { font: textType, fill: "#0A0", fontWeight: 'bold' });
      this.fText.anchor.setTo(0.5, 0.5);

      var t4 = this.game.add.text(this.game.world.centerX, 550, '(c) MCUZ Productions',
        { font: textType, fill: "#909", fontWeight: 'bold' });
      t4.anchor.setTo(0.5, 0.5);


    },

    explode: function(){
      for(var i = 0; i < this.game.rnd.integerInRange(1, 10); i++){
        this.expGen.make(this.game.rnd.integerInRange(this.oxMin, this.oxMax), this.game.rnd.integerInRange(this.oyMin, this.oyMax));
      }
      this.expTimer = this.game.time.events.add(this.game.rnd.integerInRange(100, 300), this.explode, this);
    },

    update: function() {
      // state update code
      // this.game.state.start('begin');
      if (this.aKey.isDown){
        this.game.state.start('begin');
      }
    },


    paused: function() {
      // This method will be called when game paused.
    },


    render: function() {
      // Put render operations here.
    },


    shutdown: function() {
      // This method will be called when the state is shut down
      // (i.e. you switch to another state from this one).
    }

  };

module.exports = Attract;

},{"../classes/Sound.js":2,"../prefabs/ExplosionGenerator.js":7,"../prefabs/Stars.js":14}],16:[function(require,module,exports){

'use strict';
function Menu() {}

Menu.prototype = {
  preload: function() {
	console.log('begin state');

  },

  init: function(levelData){
     if (!levelData){
       levelData = {
         level: 1,
         score: 0,
         lives: 3,
         wave: 1,
         alienFireRate: 1900,
         alienFireSide: true,
         alienFireSpeed: 200,
         alienFlightDescent: 200,
         alist: [5,4,5,4,5],
         mothershipFireTimer: 3000,
         playerShotInterval: 550
       }
     }

     this.levelData = levelData;

   },

  create: function() {
  },

  update: function() {
      this.game.state.start('play', true, false, this.levelData);
  }
};

module.exports = Menu;

},{}],17:[function(require,module,exports){
'use strict';

function Boot() {
}

Boot.prototype = {
  preload: function() {
    this.load.image('preloader', 'assets/preloader.gif');
  },
  create: function() {
    this.game.input.maxPointers = 1;
    this.game.state.start('preload');
  }
};

module.exports = Boot;

},{}],18:[function(require,module,exports){
'use strict';

var Stars = require('../prefabs/Stars.js');


function GameOver() {}

GameOver.prototype = {
  init: function(levelData){
    this.levelData = levelData;
  },

  preload: function () {

  },

  create: function () {
    this.game.stage.backgroundColor = '#000000';
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.stars = new Stars(this.game);
    
    this.gameOver = this.game.add.sprite(this.game.world.centerX, 175, 'gameover');
    this.gameOver.anchor.setTo(0.5, 0.5);
    this.gameOver.smoothed = false;
    this.game.time.events.add(4000, this.next, this);
  },

  update: function () {
  },

  next: function(){
    this.game.state.start('attract');
  }
};
module.exports = GameOver;

},{"../prefabs/Stars.js":14}],19:[function(require,module,exports){
'use strict';
  function NextLevel() {}
  NextLevel.prototype = {
    preload: function() {
      // Override this method to add some load operations.
      // If you need to use the loader, you may need to use them here.
    },
    init: function(levelData){
        this.levelData = levelData;

        var commander = this.game.add.sprite(this.game.world.centerX, 150, 'commander');
        commander.scale.setTo(3,3); commander.smoothed = false;
        commander.anchor.setTo(0.5, 0.5);

        var textType = "24px Courier";

        var phrase = [
          "Puny Human!",
          "You luck will run out eventually",
          "Death is its own reward",
          "May your weapons malfunction",
          "Your leaders will beg for mercy",
          "Resistance is futile!",
          "We come in peace - shoot to kill",
          "You are but insects!",
          "Your culture will adapt to serve us",
          "Exterminate!"
        ];

        this.game.add.text(this.game.world.centerX, 250, phrase[this.game.rnd.integerInRange(0,phrase.length-1)],
          { font: textType, fill: "#f00", fontWeight: 'bold' }).anchor.setTo(0.5, 0.5);

        this.game.add.text(this.game.world.centerX, 310, 'Prepare for next level',
          { font: textType, fill: "#0f0", fontWeight: 'bold' }).anchor.setTo(0.5, 0.5);

        this.game.time.events.add(4000, this.next, this);
    },

    next: function(){
      this.levelData.level += 1;
      if (this.levelData.level > 99) this.levelData.level = 1;
      this.levelData.wave += 1;
      if (this.levelData.wave > 10) this.levelData.wave = 1;

      // slowly increase alien fire rate
      if (this.levelData.alienFireRate > 200) this.levelData.alienFireRate += 50;

      // alternate side movement in firing
      this.levelData.alienFireSide = !this.levelData.alienFireSide;

      // increate alien fire speed
      if (this.levelData.alienFireSpeed < 350) this.levelData.alienFireSpeed += 20;

      // reset player shot interval
      this.levelData.playerShotInterval = 600;

      switch(this.levelData.wave){
          case 1: this.levelData.alienFlightDescent = 200;
            this.levelData.mothershipFireTimer = 3000;
            this.levelData.alist = [4,5,5,5,5];
            break;
          case 2:
            this.levelData.alist = [5,4,4,4,5];
            break;
          case 3:
            this.levelData.alist = [5,3,3,4,5];
            break;
          case 4: this.levelData.alienFlightDescent = 250;
            this.levelData.mothershipFireTimer = 2500;
            this.levelData.alist = [2,3,4,4,4];
            break;
          case 5:
            this.levelData.alist = [1,4,5,5,5];
            break;
          case 6:
            this.levelData.alist = [5,5,1,2,3];
            break;
          case 7: this.levelData.alienFlightDescent = 300;
            this.levelData.mothershipFireTimer = 1500;
            this.levelData.alist = [5,4,3,2,1];
            break;
          case 8:
            this.levelData.alist = [5,5,4,4,1];
            break;
          case 9:
            this.levelData.alist = [1,2,3,4,5];
            break;
          case 10:
            this.levelData.alist = [5,4,5,4,5];
            break;
      }

      this.game.state.start('play', true, false, this.levelData);
    },

    create: function() {
      // This method is called after the game engine successfully switches states.
      // Feel free to add any setup code here (do not load anything here, override preload() instead).
    },
    update: function() {
      // state update code
    },
    paused: function() {
      // This method will be called when game paused.
    },
    render: function() {
      // Put render operations here.
    },
    shutdown: function() {
      // This method will be called when the state is shut down
      // (i.e. you switch to another state from this one).
    }
  };
module.exports = NextLevel;

},{}],20:[function(require,module,exports){
  'use strict';

  var Huds = require('../classes/Huds.js');
  var Ship = require('../prefabs/Ship.js');
  var Shot = require('../prefabs/Shot.js');
  var Aliens = require('../prefabs/Aliens.js');
  var AlienShot = require('../prefabs/AlienShot.js');
  var ExplosionGenerator = require('../prefabs/ExplosionGenerator.js');
  var Stars = require('../prefabs/Stars.js');
  var MotherShip = require('../prefabs/MotherShip.js');
  var Score = require('../prefabs/Score.js');
  var Pickup = require('../prefabs/Pickup.js');
  var Sound = require('../classes/Sound.js');

  function Play() {}

  Play.prototype = {
    init: function(levelData){
       this.levelData = levelData;
     },

    create: function() {
			console.log('play state');
      this.game.stage.backgroundColor = '#000000';
      this.game.physics.startSystem(Phaser.Physics.ARCADE);
      this.stars = new Stars(this.game);
      this.sound = new Sound(this.game, this);
      this.explosion = new ExplosionGenerator(this.game, this);
      this.alienShot = new AlienShot(this.game, this);
      this.aliens = new Aliens(this.game, this); this.aliens.alienShot = this.alienShot;
      this.motherShip = new MotherShip(this.game, this);
      this.score = new Score(this.game);
      this.shot = new Shot(this.game, this); this.shot.explosion = this.explosion;
      this.pickup = new Pickup(this.game, this);
      this.ship = new Ship(this.game, this); this.ship.shot = this.shot;
      this.huds = new Huds(this.game, this.levelData);
      this.shot.state = this;
    },

    update: function() {
      this.game.physics.arcade.overlap(this.shot, this.aliens, this.shot.death, this.shot.hit, this);

      // weapons
      this.game.physics.arcade.overlap(this.alienShot, this.shot, this.alienShot.death, this.alienShot.hit, this);

      // mothership
      this.game.physics.arcade.overlap(this.motherShip, this.shot, this.motherShip.death, null, this);

      // player
      this.game.physics.arcade.overlap(this.ship, this.aliens, this.ship.death, null, this);
      this.game.physics.arcade.overlap(this.ship, this.alienShot, this.ship.death, null, this);

      // check if player collected a pickup
      this.game.physics.arcade.overlap(this.ship, this.pickup, this.pickUpHit, null, this);

      this.checkLevelComplete();
    },


    pickUpHit: function(ship, pickup){
      switch(pickup.frame){
        case 0: // green shot
          this.levelData.playerShotInterval = 400;
          ship.setWeapon(ship.FAST_FIRE);
          break;
        case 1: // double red shot
          this.levelData.playerShotInterval = 200;
          ship.setWeapon(ship.DOUBLE_FIRE);
          break;
        case 2: // shield
          ship.raiseShield();
          break;
        case 3: // kill all alien shots
          this.alienShot.killAllShots();
          break;
        case 4: // 1 up
          this.levelData.lives += 1;
          this.huds.showLives();
          break;
        case 5: // points
          break;
      }

      pickup.kill();
    },

    checkLevelComplete: function(){
    	if (this.aliens.countLiving() == 0){
    		this.levelComplete();
    	}
    },

    levelComplete: function(){
      this.game.state.start('nextlevel', true, false, this.levelData);
    },

    quit: function() {
      this.game.state.start('gameover', true, false, this.levelData);
    }
  };

  module.exports = Play;

},{"../classes/Huds.js":1,"../classes/Sound.js":2,"../prefabs/AlienShot.js":5,"../prefabs/Aliens.js":6,"../prefabs/ExplosionGenerator.js":7,"../prefabs/MotherShip.js":8,"../prefabs/Pickup.js":9,"../prefabs/Score.js":10,"../prefabs/Ship.js":11,"../prefabs/Shot.js":12,"../prefabs/Stars.js":14}],21:[function(require,module,exports){

'use strict';
function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
	  console.log('preload state');
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloader', 0);
    this.preloadBar.anchor.setTo(0.5);
    this.load.setPreloadSprite(this.preloadBar);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
		this.load.spritesheet('ship', 'assets/ship.png', 58, 58);
    this.load.image('shot', 'assets/shot.png');

    //TODO: reduce these to sprite sheet

    this.load.image('commander', 'assets/commander.png');
    this.load.image('alien1', 'assets/alien1.png');
    this.load.image('alien2', 'assets/alien2.png');
    this.load.image('alien3', 'assets/alien3.png');
    this.load.image('alien4', 'assets/alien4.png');
    this.load.image('alien5', 'assets/alien5.png');
    this.load.image('alienshot', 'assets/alienshot.png');

    this.load.spritesheet('explosion', 'assets/explosion.png', 60, 60);
    this.load.spritesheet('mothership', 'assets/mothership.png', 48, 30);

    // background graphics
    this.load.spritesheet('stars', 'assets/stars.png', 5, 5);

    // weapons bonus
    this.load.spritesheet('bonus', 'assets/score.png', 48, 30);
    this.load.spritesheet('pickup', 'assets/pickup.png', 45, 45);

    // fonts
    this.load.bitmapFont('score', 'assets/fonts/score.png', 'assets/fonts/score.fnt');

    // attract screen
    this.load.image('onslaught', 'assets/onslaught.png');
    this.load.image('gameover', 'assets/gameover.png');

    // load sfx
    var sfx = ['explosion', 'hurt', 'hit', 'mothershipfire', 'laser', 'mothershipkill', 'dive'];
    for(var i = 0; i < sfx.length; i++){
      this.game.load.audio(sfx[i]+'sfx', 'assets/sfx/' + sfx[i] + '.wav');
    }
	},

  create: function() {
  },

  update: function() {
    if(!!this.ready) {
      this.game.state.start('attract');
      //this.game.state.start('attract');
    }
  },

  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;

},{}]},{},[3])