(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Grid = function(state, game) {
  this.state = state;
  this.game = game;

  this._BLANK = 0;
  this._FACTORY = 1;
  this._STARTAREA = 2;
  this._TREE = 3;
  this._ROAD = 4;
  this._SILO = 5;
  this._BONUS = 6;

  this.tileSize = 48;
  this.halfTile = Math.round(this.tileSize / 2);
  this.w = window.gdata.lData.worldSize * 14;
  this.h = window.gdata.lData.worldSize * 14;
  this.game.world.resize(this.w * this.tileSize, this.h * this.tileSize);
  this.grid = new Array(this.w);
  for (var i = 0; i < this.w; i++) {
    this.grid[i] = new Array(this.h);
    this.grid[i].fill(0);
  }

  this.placedShip = {
    x: 200,
    y: 200
  };
  if (window.gdata.lData.roads) { this.placeRoads(window.gdata.lData.roadType); }
  this.placeBonus();
  this.placeShip();
  this.placeFactories();
  this.placeTrees();
  if (window.gdata.lData.silo) { this.placeSilos(window.gdata.lData.siloNum); }
};


Grid.prototype.placeBonus = function(){
  var y = this.game.rnd.integerInRange(0, this.h);
  var x = this.game.rnd.integerInRange(0, this.w);
  //var x = 5;
  //var y = 5;
  if (this.get(x, y) == this._BLANK){
    this.set(x, y, this._BONUS);
    this.state.bonus.init(this.halfTile + x * this.tileSize, this.halfTile + y * this.tileSize, Const.DOUBLE);
  }
};

Grid.prototype.placeShip = function(){
  var sx = this.game.rnd.integerInRange(0, (window.gdata.worldSize * 14) - 15);
  var sy = this.game.rnd.integerInRange(0, (window.gdata.worldSize * 14) - 10);

  while(!this.isEmpty(sx, sy, 15, 10, this._BLANK)){
    sx = this.game.rnd.integerInRange(0, (window.gdata.worldSize * 14) - 15);
    sy = this.game.rnd.integerInRange(0, (window.gdata.worldSize * 14) - 10);
  }

  this.fillGrid(sx, sy, 15, 10, this._STARTAREA);

  this.placedShip = {};
  this.placedShip.x = (sx * this.tileSize) + (this.game.width/2);
  this.placedShip.y = (sy * this.tileSize) + (this.game.height/2);

  for(var t = 0; t < 3; t++){
    for(var i = 0; i < 15; i++){
      var s = this.game.add.sprite(
        (sx * this.tileSize) + (i * this.tileSize) + this.halfTile,
        this.halfTile + ((sy + t) * this.tileSize), 'terrain', 1
      );
      s.anchor.setTo(0.5, 0.5);
      s.angle = this.game.rnd.integerInRange(0, 360);
      s = this.game.add.sprite(
        (sx * this.tileSize) + (i * this.tileSize) + this.halfTile,
        this.halfTile + ((sy + 7 + t) * this.tileSize), 'terrain', 1
      );
      s.anchor.setTo(0.5, 0.5);
      s.angle = this.game.rnd.integerInRange(0, 360);
    }
  }

  for(var i = 3; i < 7; i++){
    for(var t = 0; t < 2; t++){
      var s = this.game.add.sprite(
        (sx * this.tileSize) + (t * this.tileSize)+ this.halfTile,
        (sy * this.tileSize) + (i * this.tileSize) + this.halfTile,
        'terrain', 1
      );
      s.anchor.setTo(0.5, 0.5);
      s.angle = this.game.rnd.integerInRange(0, 360);
      s = this.game.add.sprite(
        (13 * this.tileSize) + (sx * this.tileSize) + (t * this.tileSize)+ this.halfTile,
        (sy * this.tileSize) + (i * this.tileSize) + this.halfTile,
        'terrain', 1
      );
      s.anchor.setTo(0.5, 0.5);
    }
      s.angle = this.game.rnd.integerInRange(0, 360);
  }


};

Grid.prototype.placeSilos = function(num) {
  var placed = 0;
  for (var i = 0; i < num; i++) {
    var count = 5;
    while(count > 0){
      count--;
      var x = this.game.rnd.integerInRange(1, this.w - 1);
      var y = this.game.rnd.integerInRange(1, this.h - 1);
      if (this.get(x, y) == this._BLANK) {
        this.set(x, y, this._SILO);
        this.state.silos.generate(this.halfTile + x * this.tileSize, this.halfTile + y * this.tileSize);
        count = 0;
        placed++;
      }
    }
  }
};

Grid.prototype.placeRoads = function(type) {
  var x, y, s;
  switch (type) {
    case 3: // zig zag
      // across
      y = this.game.rnd.integerInRange(Math.round(this.h * 0.25), Math.round(this.h * 0.35));
      for (var i = 0; i < this.w / 2; i++) {
        this.set(i, y, this._ROAD);
        s = this.game.add.sprite(i * this.tileSize, y * this.tileSize, 'road', this.game.rnd.integerInRange(0, 3));
      }
      // corner
      x = (this.w / 2);
      this.set(x, y, this._ROAD);
      s = this.game.add.sprite(x * this.tileSize, y * this.tileSize, 'road', 6);
      x++;
      // down
      for (var i = y + 1; i < (y + Math.round(this.h * 0.25)); i++) {
        this.set(x - 1, i, this._ROAD);
        s = this.game.add.sprite(x * this.tileSize, i * this.tileSize, 'road', this.game.rnd.integerInRange(0, 3));
        s.angle = 90;
      }
      // corner
      y = y + Math.round(this.h * 0.25) + 1;
      this.set(x - 1, y, this._ROAD);
      s = this.game.add.sprite(x * this.tileSize, y * this.tileSize, 'road', 6);
      s.angle = 180;
      // across
      for (var i = x; i < this.w; i++) {
        this.set(i, y - 1, this._ROAD);
        s = this.game.add.sprite(i * this.tileSize, (y - 1) * this.tileSize, 'road', this.game.rnd.integerInRange(0, 3));
      }
      break;
    case 2: // square
      var ox = this.game.rnd.integerInRange(Math.round(this.w * 0.15), Math.round(this.w * 0.33));
      var oy = this.game.rnd.integerInRange(Math.round(this.h * 0.15), Math.round(this.h * 0.33));
      for (var i = ox + 1; i < this.w - (ox + 1); i++) {
        this.set(i, oy, this._ROAD);
        s = this.game.add.sprite(i * this.tileSize, oy * this.tileSize, 'road', this.game.rnd.integerInRange(0, 3));
        this.set(i, this.h - (oy + 1), this._ROAD);
        s = this.game.add.sprite(i * this.tileSize, (this.h - (oy + 1)) * this.tileSize, 'road', this.game.rnd.integerInRange(0, 3));
      }

      for (var i = oy + 1; i < this.h - (oy + 1); i++) {
        this.set(ox, i, this._ROAD);
        s = this.game.add.sprite((ox + 1) * this.tileSize, i * this.tileSize, 'road', this.game.rnd.integerInRange(0, 3));
        s.angle = 90;
        this.set(this.w - (ox + 1), i, this._ROAD);
        s = this.game.add.sprite((this.w - ox) * this.tileSize, i * this.tileSize, 'road', this.game.rnd.integerInRange(0, 3));
        s.angle = 90;
      }

      // corners
      this.set(this.w - (ox + 1), oy, this._ROAD);
      s = this.game.add.sprite((this.w - (ox + 1)) * this.tileSize, oy * this.tileSize, 'road', 6);
      this.set(ox, oy, this._ROAD);
      s = this.game.add.sprite((this.w - (ox)) * this.tileSize, (this.h - (oy + 1)) * this.tileSize, 'road', 6);
      s.angle = 90;

      this.set(ox, this.h - oy, this._ROAD);
      s = this.game.add.sprite((ox + 1) * this.tileSize, (this.h - oy) * this.tileSize, 'road', 6);
      s.angle = 180;
      this.set(ox, oy - 1, this._ROAD);
      s = this.game.add.sprite(ox * this.tileSize, (oy + 1) * this.tileSize, 'road', 6);
      s.angle = 270;
      break;

    case 1: // cross
      y = this.game.rnd.integerInRange(Math.round(this.h * 0.15), Math.round(this.h * 0.4));
      x = this.game.rnd.integerInRange(Math.round(this.w * 0.2), this.w - Math.round(this.w * 0.2));
      // horizontal road
      for (var i = 0; i < this.w; i++) {
        this.set(i, y, this._ROAD);
        s = this.state.roads.create(i * this.tileSize, y * this.tileSize, 'road', this.game.rnd.integerInRange(0, 3));
      }
      // vertical road
      for (var i = 0; i < this.h; i++) {
        this.set(x, i, this._ROAD);
        s = this.state.roads.create((x + 1) * this.tileSize, i * this.tileSize, 'road', this.game.rnd.integerInRange(0, 3));
        s.angle = 90;
      }
      if (this.game.rnd.pick([true, false])) {
        // place horizontal trucks
        var dir = this.game.rnd.pick([0, 180]);
        var ci = Math.round((this.w * 48) / 75);
        for (var i = 0; i < ci; i++) {
          if (this.game.rnd.integerInRange(0, 10) > 7) {
            s = this.state.trucks.generate(i * 75, this.halfTile + (y * this.tileSize), 2, dir);
          }
        }
      } else {
        // place vertical trucks
        var dir = this.game.rnd.pick([90, 270]);
        var ci = Math.round((this.h * 48) / 75);
        for (var i = 0; i < ci; i++) {
          if (this.game.rnd.integerInRange(0, 10) > 7) {
            s = this.state.trucks.generate(this.halfTile + (x * this.tileSize), i * 75, 2, dir);
          }
        }
      }

      break;
  }
};

Grid.prototype.placeTrees = function() {
  for (var x = 0; x < this.w; x++) {
    for (var y = 0; y < this.h; y++) {
      if (this.get(x, y) == this._BLANK) {
        if (this.game.rnd.integerInRange(0, 10) < (window.gdata.lData.forestation * 10)) {
          this.set(x, y, this._TREE);
          var s = this.game.add.sprite(this.halfTile + x * this.tileSize, this.halfTile + y * this.tileSize, 'terrain',
            this.game.rnd.integerInRange(0, 4));
          s.anchor.setTo(0.5, 0.5);
        }
      }
    }
  }
};

Grid.prototype.placeFactories = function() {
  for (var i = 0; i < window.gdata.lData.factories; i++) {
    var placed = false;
    while (!placed) {
      var x = this.game.rnd.integerInRange(3, this.w - 3);
      var y = this.game.rnd.integerInRange(3, this.h - 3);
      if (this.isEmpty(x, y, 3, 3, this._BLANK)) {
        this.fillGrid(x, y, 3, 3, this._FACTORY);
        placed = true;
        this.state.factories.generate(72 + x * this.tileSize, 72 + y * this.tileSize);
      }
    }
  }
};

Grid.prototype.isEmpty = function(gx, gy, gw, gh, gvalue) {
  var result = true;
  for (var x = gx; x < (gx + gw); x++) {
    for (var y = gy; y < (gy + gh); y++) {
      if (this.get(x, y) != gvalue) {
        result = false;
        break;
      }
    }
    if (result == false) break;
  }
  return result;
};

Grid.prototype.get = function(x, y) {
  return this.grid[x][y];
};

Grid.prototype.set = function(x, y, value) {
  this.grid[x][y] = value;
};

Grid.prototype.inBounds = function(x, y) {
  if (x > this.w || x < 0 || y < 0 || y > this.h) return false;
  return true;
}

Grid.prototype.fillGrid = function(gx, gy, gw, gh, gvalue) {
  for (var x = gx; x < (gx + gw); x++) {
    for (var y = gy; y < (gy + gh); y++) {
      this.grid[x][y] = gvalue;
    }
  }
};

Grid.prototype.display = function() {
  var graphics = this.game.add.graphics(0, 0);
  graphics.lineStyle(1, 0xFF0000, 1);
  for (var i = 0; i < this.w; i++) {
    graphics.moveTo(i * this.tileSize, 0);
    graphics.lineTo(i * this.tileSize, this.tileSize * this.h);
    graphics.moveTo(0, i * this.tileSize);
    graphics.lineTo(this.tileSize * this.w, i * this.tileSize);
  }
  var style = {
    fill: "#ffffff",
    font: "bold 12px Arial"
  };
  for (var x = 0; x < this.w; x++) {
    for (var y = 0; y < this.h; y++) {
      var s = this.grid[x][y] + '';
      var txt = this.game.add.text(x * this.tileSize, y * this.tileSize, s, style);
    }
  }


};

module.exports = Grid;

},{}],2:[function(require,module,exports){
'use strict';

var Huds = function(state, game){
  this.state = state; this.game = game;
  this.creditsHtml = document.getElementById('credits');
  this.shipsHtml = document.getElementById('ships');
  this.countryHtml = document.getElementById('country');
  this.msgStyle = {fill:"#ffffff", stroke:"#000000", strokeThickness:2, font:"32px Arial"};
  this.msgText = this.game.add.text(this.game.width/2, this.game.height/2 - 40, "Get Ready", this.msgStyle);
  this.msgText.anchor.setTo(0.5, 0.5);
  this.msgText.fixedToCamera = true;
};

Huds.prototype.setText = function(strtxt){
  this.msgText.text = strtxt;
  this.msgText.update();
};

Huds.prototype.update = function(){
  var cs = String(window.gdata.credits);
  if (cs.length < 8) {
    var count = 8 - cs.length;
    for(var i = 0; i < count; i++){
      cs = '0' + cs;
    }
  }
  this.creditsHtml.innerText = cs;
  this.shipsHtml.innerText = String(window.gdata.ships);
  this.countryHtml.innerText = String(window.gdata.lData.name);
}



module.exports = Huds;

},{}],3:[function(require,module,exports){
'use strict';

/*
attackCloud - boolean
worldSize: number (world w x h in screens)
factories: number (amount of factories at least 1)
forestation: floating point 0.0 - 1.0 determines amount of forestation - be careful not to use too large a number e.g. 0.9!
there will be no room for enemies,
fighter: boolean,
fightertype:Const.EMISSILE, Const.ESHOT1, Const.ESHOT2
silo: boolean,
siloNum: amount of silos to populate map with,
roads: boolean,
roadType: see placeRoads method in grid (only zigzag, square, cross implemented)
*/

var LevelData = function(){
    this.levels = [
      {
        name: "Australia",
        description: "They wreak in a land down under! clean this mess up\nShould be easy, nice training run for Eco Noobs",
        worldSize: 3,
        factories: 1,
      },
      {
        name: "Mexico",
        description: "Large area to cover here, with reports of strange yellow cloud formations",
        worldSize: 4,
        factories: 2,
        attackCloud: true
      },
      {
        name: "Canada",
        description: "Find your targets in them there Maple Tree forests below.\nHint: Use the radar (top left) to find bonus",
        worldSize: 4,
        factories: 3,
        forestation: 0.5
      },
      {
        name: "New Zealand",
        description: "The clean green image of New Zealand is a lie! get in there and fix them kiwi's up.\nBy the way, the Kiwi's have increased there ground defense budget",
        worldSize: 4,
        factories: 4,
        forestation: 0.4,
        roads: true,
        roadType: 1,
        silo: true,
        siloNum:60
      },
      {
        name: "Argentina",
        description: "Don't cry for me Argentina.  Well they won't but the rest of the world will\nWatch out for Hostile Aircraft",
        worldSize: 3,
        factories: 4,
        forestation: 0.1,
        roads: true,
        roadType: 1,
        silo: true,
        siloNum:15,
        fighters: true,
        fightersType: Const.ESHOT1
      },
      {
        name: "Czech Republic",
        description: "Welcome to the Czech Republic.  A beautiful place apart from \nInternational Companies and their Factories!" +
        "\nThe Czech airforce is faaassstt!! Watch out",
        worldSize: 3,
        factories: 3,
        forestation: 0.2,
        roads: true,
        roadType: 2,
        silo: true,
        siloNum:15,
        fighters: true,
        fightersType: Const.ESHOT2
      },
      {
        name: "America",
        description: "The U.S of A is waaay waaay waaay exceeding their limit on carbon emissions etc." +
        "\nToo many Corporates focusing on the bottom line and not earth mother!" +
        "\nWatch out for stealth fighters and guided missiles!",
        worldSize: 6,
        factories: 5,
        forestation: 0.2,
        roads: true,
        roadType: 2,
        silo: true,
        siloNum:35,
        fighters: true,
        fightersType: Const.EMISSILE,
        attackCloud: true
      },


    ];
};

LevelData.prototype.constructor = LevelData;

LevelData.prototype.getLevel = function(levelNo){
  var data = this.getDefault();
  if (levelNo > this.levels.length) return data;
  Object.assign(data, this.levels[levelNo]);
  return data;
};

LevelData.prototype.getDefault = function(){
  return {
    name:"default country name",
    description:"default country description",
    worldSize: 3,
    factories: 1,
    forestation: 0.1,
    fighters: false,
    attackCloud: false,
    silo: true,
    siloNum: 10,
    roads: false
  };
};

module.exports = LevelData;

},{}],4:[function(require,module,exports){
'use strict';

//global variables

window.onload = function () {
  var game = new Phaser.Game(700, 450, Phaser.AUTO, 'ecowarrior');

  // Game States
  game.state.add('boot', require('./states/boot'));
  game.state.add('gameover', require('./states/gameover'));
  game.state.add('level', require('./states/level'));
  game.state.add('menu', require('./states/menu'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));
  

  game.state.start('boot');
};

},{"./states/boot":20,"./states/gameover":21,"./states/level":22,"./states/menu":23,"./states/play":24,"./states/preload":25}],5:[function(require,module,exports){
'use strict';

var Bonus = function(state) {
  this.state = state;
  this.game = state.game;
  Phaser.Sprite.call(this, this.game, 0, 0, 'bonus');
	this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.game.add.existing(this);
  this.animations.add('bonus', [0,1,2,3,4], 10, true);
  this.animations.add('freeship', [5,6], 10, true);
  this.animations.add('double', [7,8], 10, true);
  this.animations.add('triple', [9,10], 10, true);
  this.anchor.setTo(0.5, 0.5);
  this.kill();
};

Bonus.prototype = Object.create(Phaser.Sprite.prototype);
Bonus.prototype.constructor = Bonus;

Bonus.prototype.init = function(x, y, type) {
	this.reset(x, y);
  this.animations.play('bonus');
  this.type = this.game.rnd.pick([Const.FREESHIP, Const.DOUBLE, Const.TRIPLE]);
  this.mode = Const.HIT;
};


Bonus.prototype.pickup = function(){
  if (this.mode == Const.PICKUP){
      this.kill();
      switch(this.type){
        case Const.FREESHIP:
          window.gdata.ships++;
          break;
        case Const.DOUBLE:
          window.gdata.fireMode = this.type;
          break;
        case Const.TRIPLE:
          window.gdata.fireMode = this.type;
          break;
      }
  }
};

Bonus.prototype.hit = function(bonus, shot){
  switch(this.mode){
    case Const.HIT:
      this.state.bonusFx.stop();
      this.state.bonusFx.play();
      this.frame = 1;
      this.animations.stop();
      this.mode = Const.PICKUP;
      if (this.type == Const.FREESHIP){
        this.animations.play('freeship');
      } else if (this.type == Const.DOUBLE){
        this.animations.play('double');
      }else if (this.type == Const.TRIPLE){
        this.animations.play('triple');
      }
      break;
  }
};


module.exports = Bonus;

},{}],6:[function(require,module,exports){
'use strict';

var Cloud = function(state) {
  this.state = state;
  this.game = state.game;
  Phaser.Sprite.call(this, this.game, 0, 0, 'cloud');
	this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.collideWorldBounds = true;
  this.body.bounce.setTo(1, 1);
  this.speed = 100;
  this.game.add.existing(this);
  this.anchor.setTo(0.5, 0.5);
  this.kill();
};

Cloud.prototype = Object.create(Phaser.Sprite.prototype);
Cloud.prototype.constructor = Cloud;

Cloud.prototype.init = function(x, y, type) {
	this.reset(x, y, 1);
  this.frame = this.game.rnd.integerInRange(0,4);
  this.angle = this.game.rnd.integerInRange(360);
  this.scale.setTo(this.game.rnd.realInRange(1, 1.5), this.game.rnd.realInRange(1, 1.5));
  switch(type){
    case 0:
      this.changeDirection();
    break;
    case 1:
      this.tint = "0xc5fc6b"; this.health = 2;
      this.attackDirection();
      break;
  }
};


Cloud.prototype.attackDirection = function(){
  this.game.physics.arcade.moveToObject(this, this.state.ship, this.speed);
  //this.body.velocity.setTo(this.game.rnd.integerInRange(-this.speed, this.speed), this.game.rnd.integerInRange(-this.speed, this.speed));
  this.timer = this.game.time.events.add(this.game.rnd.integerInRange(200, 1000), this.attackDirection, this);
}

Cloud.prototype.changeDirection = function(){
  this.body.velocity.setTo(this.game.rnd.integerInRange(-this.speed, this.speed), this.game.rnd.integerInRange(-this.speed, this.speed));
  this.timer = this.game.time.events.add(this.game.rnd.integerInRange(200, 2000), this.changeDirection, this);
}


Cloud.prototype.update = function() {
  var distance = Phaser.Point.distance(this, this.state.ship, true);
  // recycle cloud if way off mark
  if (distance > 1000) this.kill();
};

Cloud.prototype.hit = function(){
  this.health--;
  if (this.health <= 0) {
    this.state.explosions.generate(this.x, this.y);
    this.state.airExp.stop();
    this.state.airExp.play();    
    window.gdata.credits = window.gdata.credits + 25;
    this.state.huds.update();
    if (this.timer != null) this.game.time.events.remove(this.timer);
    this.kill();
  }
};

module.exports = Cloud;

},{}],7:[function(require,module,exports){
'use strict';

var Cloud = require('../prefabs/Cloud.js');


var Clouds = function(state, game){
  this.state = state; this.game = game;
  Phaser.Group.call(this, this.game, 'Clouds', false, true, Phaser.Physics.ARCADE);
  this.game.add.existing(this);

  for(var i = 0; i < 40; i++){
    var cc = new Cloud(this.state);
    this.add(cc);
  }
};

Clouds.prototype = Object.create(Phaser.Group.prototype);
Clouds.prototype.constructor = Clouds;

Clouds.prototype.generate = function(x, y, num, type){
  if (this.countLiving() > 8) return;
  for(var i = 0; i < num; i++){
    var cloud = this.getFirstDead(x, y);
    if (cloud != null) {
      cloud.init(x, y, type);
    }
  }
};

module.exports = Clouds;

},{"../prefabs/Cloud.js":6}],8:[function(require,module,exports){
'use strict';

var EShots = function(state, game){
  console.log('EShots constructor');
  console.log(Const);
  this.state = state; this.game = game;
  Phaser.Group.call(this, this.game, 'EShots', false, true, Phaser.Physics.ARCADE);
  this.game.add.existing(this);

  this.eshot1Group = this.game.add.group(); this.eshot1Group.physicsBodyType = Phaser.Physics.ARCADE; this.eshot1Group.enableBody = true;
  this.eshot2Group = this.game.add.group(); this.eshot2Group.physicsBodyType = Phaser.Physics.ARCADE; this.eshot2Group.enableBody = true;
  this.emissileGroup = this.game.add.group(); this.emissileGroup.physicsBodyType = Phaser.Physics.ARCADE; this.emissileGroup.enableBody = true;

  this.add(this.eshot1Group);
  this.add(this.eshot2Group);
  this.add(this.emissileGroup);

  this.eshot1Group.createMultiple(20, 'eshot1');
  this.eshot2Group.createMultiple(20, 'eshot2');
  this.emissileGroup.createMultiple(10, 'emissile');

  this.eshot1Group.setAll('autoCull', true);
  this.eshot2Group.setAll('autoCull', true);
  this.eshot1Group.setAll('outOfCameraBoundsKill', true);
  this.eshot2Group.setAll('outOfCameraBoundsKill', true);
  this.eshot1Group.setAll('anchor.x', 0.5);
  this.eshot1Group.setAll('anchor.y', 0.5);
  this.eshot2Group.setAll('anchor.x', 0.5);
  this.eshot2Group.setAll('anchor.y', 0.5);
  this.eshot2Group.callAll('animations.add', 'animations', 'fire', [0,1], 10, true);
  this.eshot2Group.callAll('animations.play', 'animations', 'fire');

  this.emissileGroup.callAll('animations.add', 'animations', 'thrust', [0,1], 10, true);
  this.emissileGroup.callAll('animations.play', 'animations', 'thrust');
  this.emissileGroup.setAll('autoCull', true);
  this.emissileGroup.setAll('outOfCameraBoundsKill', true);
  this.emissileGroup.setAll('anchor.x', 0.5);
  this.emissileGroup.setAll('anchor.y', 0.5);
  this.emissileGroup.setAll('state', this.state, false, false, 0, true);
  this.emissileGroup.setAll('hit', function(){
    this.state.explosions.generate(this.x, this.y);
    this.state.airExp.stop();
    this.state.airExp.play();    
    this.kill();
  }, false, false, 0, true);
};


EShots.prototype = Object.create(Phaser.Group.prototype);
EShots.prototype.constructor = EShots;


EShots.prototype.fire = function(x, y, angle, speed, type){
  if (type == Const.ESHOT1 || type == Const.ESHOT2){
    var s;
    if (type == Const.ESHOT1){ s = this.eshot1Group.getFirstDead(); } else { s = this.eshot2Group.getFirstDead(); }
    if (s != null){
      s.reset(x, y);
      if (type == Const.ESHOT2) {
        s.frame = 1;
        this.state.eshot2fx.stop();
        this.state.eshot2fx.play();
      } else {
        this.state.eshot1fx.stop();
        this.state.eshot1fx.play();
      }
      s.angle = angle;
      s.body.velocity = this.game.physics.arcade.velocityFromAngle(angle, speed);
    }
  }
  if (type == Const.EMISSILE){
    var s = this.emissileGroup.getFirstDead();
    if (s != null){
      s.reset(x, y);
      s.angle = angle; s.speed = speed;
      this.state.missileFx.stop();
      this.state.missileFx.play();
      s.body.velocity = this.game.physics.arcade.velocityFromAngle(angle, speed);
      s.timer = this.game.time.events.add(200, this.seekPlayer, this, s);
    }
  }

};

EShots.prototype.seekPlayer = function(s){
  if (!this.state.ship.alive) return;
  var d = Phaser.Math.radToDeg(this.game.physics.arcade.angleBetween(s, this.state.ship) - s.rotation);
  if (d > 10){
    s.angle += 11.5;
  } else if (d < -10) {
    s.angle -= 11.5;
  }
  //this.rotation = this.game.physics.arcade.angleBetween(this, this.state.ship);
  s.body.velocity = this.game.physics.arcade.velocityFromAngle(s.angle, s.speed);
  s.timer = this.game.time.events.add(200, this.seekPlayer, this, s);
};

EShots.prototype.update = function(){
};

EShots.prototype.killed = function(){
  if (this.timer != null) this.game.time.events.remove(this.timer);
};


module.exports = EShots;

},{}],9:[function(require,module,exports){
'use strict';

var Explosions = function(state, game){
  this.state = state; this.game = game;
  Phaser.Group.call(this, this.game, 'explosions', false, true, Phaser.Physics.ARCADE);
  this.game.add.existing(this);
  this.createMultiple(25, 'explosion', 0);
  this.callAll('animations.add', 'animations', 'explode', [0,1,2,3,4]);
  this.setAll('scale.x', 2);
  this.setAll('scale.y', 2);
  this.setAll('anchor.x', 0.5);
  this.setAll('anchor.y', 0.5);
  this.setAll('scale.x', 2);
  this.setAll('scale.y', 2);
  this.callAll('kill');
};

Explosions.prototype = Object.create(Phaser.Group.prototype);
Explosions.prototype.constructor = Explosions;

Explosions.prototype.generate = function(x, y){
  var exp = this.getFirstDead();
  if (exp == null) return;
  exp.reset(x, y);
  exp.animations.play('explode', 8, false, true);
};

Explosions.prototype.big = function(x, y){
  for(var col = -1; col < 2; col++){
		for(var row = -1; row < 2; row++){
			this.generate(x + (row * 48), y + (col * 48));
		}
	}
};

module.exports = Explosions;

},{}],10:[function(require,module,exports){
'use strict';

var Factory = require('../prefabs/Factory.js');


var Factories = function(state, game){
  this.state = state; this.game = game;
  Phaser.Group.call(this, this.game, 'Factories', false, true, Phaser.Physics.ARCADE);
  this.game.add.existing(this);
};

Factories.prototype = Object.create(Phaser.Group.prototype);
Factories.prototype.constructor = Factories;

Factories.prototype.generate = function(x, y){
  var factory = new Factory(this.state, this.game);
  factory.x = x; factory.y = y;
  this.add(factory);
};

Factories.prototype.place = function(num){
  for(var i = 0; i < num; i++){
    var factory = new Factory(this.state, this.game);
    factory.x = this.game.rnd.integerInRange(factory.width, this.game.world.width - factory.width);
    factory.y = this.game.rnd.integerInRange(factory.height, this.game.world.height - factory.height);
    while(factory.body.embedded){
      factory.x = this.game.rnd.integerInRange(factory.width, this.game.world.width - factory.width);
      factory.y = this.game.rnd.integerInRange(factory.height, this.game.world.height - factory.height);
    }
    this.add(factory);
  }
};

Factories.prototype.addClouds = function(clouds){
  this.clouds = clouds;
  this.forEach(
    function(factory){
      factory.initCloud(clouds);
    },
    this
  );
}

module.exports = Factories;

},{"../prefabs/Factory.js":11}],11:[function(require,module,exports){
'use strict';

var Factory = function(state, game, x, y) {
  this.game = game; this.state = state;
  Phaser.Sprite.call(this, game, x, y, 'factory');
  this.game.add.existing(this);
  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.anchor.setTo(0.5, 0.5);
  this.health = Const.FACTORYMAX;
};

Factory.prototype = Object.create(Phaser.Sprite.prototype);
Factory.prototype.constructor = Factory;

Factory.prototype.update = function() {
};

Factory.prototype.initCloud = function(clouds){
  this.clouds = clouds;
  this.timer = this.game.time.events.add(this.game.rnd.integerInRange(500, 3000), this.generate, this);
};

Factory.prototype.generate = function(){
  // if ship close to factory generate attacker cloud
  var type = 0;
  if (window.gdata.lData.attackCloud){
    var dist = Phaser.Point.distance(this, this.state.ship, true);
    if (dist < 416){
      if (this.game.rnd.integer(4) > 2) { type = 1; }
    }
  }
  if (this.inCamera){
    this.state.gasfx.stop();
    this.state.gasfx.play();
  }

  this.clouds.generate(this.x + this.game.rnd.integerInRange(-20, 20), this.y + this.game.rnd.integerInRange(-20, 0), this.game.rnd.integerInRange(1,3), type);
  this.timer = this.game.time.events.add(this.game.rnd.integerInRange(500, 3000), this.generate, this);
}


Factory.prototype.hit = function(){
  this.health--;
  this.state.hitfx.stop();
  this.state.hitfx.play();
  if (this.health == (Const.FACTORYMAX - Const.FACTORYINC)){
    this.frame = 1;
  } else if (this.health == (Const.FACTORYMAX - (Const.FACTORYINC * 2))){
    this.frame = 2;
  } else if (this.health == 0) {
    if (this.timer != null) this.game.time.events.remove(this.timer);
    this.state.explosions.big(this.x, this.y);
    this.state.factoryExp.stop();
    this.state.factoryExp.play();
    this.frame = 3;
    this.body.enable = false;
  }
};

module.exports = Factory;

},{}],12:[function(require,module,exports){
'use strict';

var Fighter = function(state, game) {
  this.state = state;
  this.game = game;
  Phaser.Sprite.call(this, this.game, 0, 0, 'fighter', 1);
	this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.speed = 150;
  this.game.add.existing(this);
  this.anchor.setTo(0.5, 0.5);
  this.events.onKilled.add(this.killed, this);
  this.autoCull = true;
  this.outOfCameraBoundsKill = true;
  this.kill();
};

Fighter.prototype = Object.create(Phaser.Sprite.prototype);
Fighter.prototype.constructor = Fighter;

Fighter.prototype.init = function(type){
	this.reset(0, 0, 1);
  var sw = this.width/2; var sh = this.height/2;
  var side = this.game.rnd.integerInRange(1, 4);
  if (side < 3){
    this.x = this.game.camera.x + this.game.rnd.integerInRange(0, this.game.width);
  } else {
    this.y = this.game.camera.y + this.game.rnd.integerInRange(0, this.game.height);
  }
  switch(side){
    case 1:
      this.y = this.game.camera.y - sh;
    break;
    case 2:
      this.y = this.game.camera.y + this.game.height - sh;
    break;
    case 3:
      this.x = this.game.camera.x - sw;
    break;
    case 4:
      this.x = this.game.camera.x + this.game.width - sw;
    break;
  }

  this.rotation = this.game.physics.arcade.angleBetween(this, this.state.ship);
  this.body.velocity = this.game.physics.arcade.velocityFromAngle(this.angle, this.speed);

  switch(type){
    case Const.EMISSILE:
      if (this.game.rnd.pick([true, false])){
        this.fireCount = 4;
        this.fireTimer = this.game.time.events.add(1500, this.fire, this, Const.EMISSILE);
      }
      this.frame = 0;
      break;
    case Const.ESHOT1:
      this.fireCount = 4;
      this.fireTimer = this.game.time.events.add(300, this.fire, this, Const.ESHOT1);
      this.moveCount = 15;
      this.frame = 1;
      this.attackDirection();
      break;
    case Const.ESHOT2:
      this.fireCount = 4;
      this.fireTimer = this.game.time.events.add(100, this.fire, this, Const.ESHOT2);
      this.moveCount = 15;
      this.frame = 2;
      this.body.acceleration = this.game.physics.arcade.accelerationFromRotation(this.rotation, this.speed/2);
      //this.attackDirection();
      break;
  }

};


Fighter.prototype.attackDirection = function(){
  if (!this.state.ship.alive) return;
  if (this.moveCount == 0) return;
  this.moveCount--;
  var p = new Phaser.Point(this.state.ship.x + Math.cos(this.state.ship.rotation - 3.14) * 100, this.state.ship.y + Math.sin(this.state.ship.rotation - 3.14) * 100);
  var d = this.game.physics.arcade.angleBetween(this, p);
  // - this.rotation;
  if (d < 0){
    this.angle += 11;
  } else {
    this.angle -= 11;
  }
  //this.rotation = this.game.physics.arcade.angleBetween(this, p);
  this.body.velocity = this.game.physics.arcade.velocityFromAngle(this.angle, this.speed);
  this.timer = this.game.time.events.add(300, this.attackDirection, this);
};

Fighter.prototype.fire = function(fireType){
  switch(fireType){
    case Const.EMISSILE:
      this.state.eshots.fire(this.x, this.y, this.angle, 180, Const.EMISSILE);
      //this.fireTimer = this.game.time.events.add(this.game.rnd.pick([1500, 3000]), this.fire, this, Const.EMISSILE);
      break;
    case Const.ESHOT1:
      this.state.eshots.fire(this.x, this.y, Phaser.Math.radToDeg(this.game.physics.arcade.angleBetween(this, this.state.ship)), 280, Const.ESHOT1);
      this.fireTimer = this.game.time.events.add(this.game.rnd.pick([900, 2000]), this.fire, this, Const.ESHOT1);
      break;
    case Const.ESHOT2:
      if (this.game.rnd.pick([true, false])){
        this.state.eshots.fire(this.x, this.y, this.angle, 380, Const.ESHOT2);
      }
      //this.fireTimer = this.game.time.events.add(this.game.rnd.pick([900, 2000]), this.fire, this, Const.ESHOT2);
      break;
  }
};


Fighter.prototype.update = function() {
  // var distance = Phaser.Point.distance(this, this.state.ship, true);
  // if (distance > 1200) { this.kill(); return; }
};

Fighter.prototype.killed = function(){
  if (this.timer != null) this.game.time.events.remove(this.timer);
  if (this.fireTimer != null) this.game.time.events.remove(this.fireTimer);
};


Fighter.prototype.hit = function(){
  this.health--;
  if (this.health <= 0) {
    this.state.explosions.generate(this.x, this.y);
    this.state.airExp.stop();
    this.state.airExp.play();
    window.gdata.credits = window.gdata.credits + 47;
    this.state.huds.update();
    this.kill();
  }
};

module.exports = Fighter;

},{}],13:[function(require,module,exports){
'use strict';

var Fighter = require('../prefabs/Fighter.js');

var Fighters = function(state, game){
  this.state = state; this.game = game;
  Phaser.Group.call(this, this.game, 'Fighters', false, true, Phaser.Physics.ARCADE);
  this.game.add.existing(this);

  for(var i = 0; i < 5; i++){
    var cc = new Fighter(this.state, this.game);
    this.add(cc);
  }
};

Fighters.prototype = Object.create(Phaser.Group.prototype);
Fighters.prototype.constructor = Fighters;

Fighters.prototype.generate = function(type){
  this.timer = this.game.time.events.add(500, this.attack, this, type);
};

Fighters.prototype.attack = function(type){

  var nummax;

  switch(type){
    case Const.ESHOT1:
      nummax = 4;
      break;
    case Const.EMISSILE:
      nummax = 3;
      break;
    case Const.ESHOT2:
      nummax = 2;
      break;
  }

  var num = nummax - this.countLiving();
  if (num > 0){
    var s = this.getFirstDead();
    if (s != null){
      s.init(type);
    }
  }
  this.timer = this.game.time.events.add(2500, this.attack, this, type);

};

module.exports = Fighters;

},{"../prefabs/Fighter.js":12}],14:[function(require,module,exports){
'use strict';

var Shot = require('../prefabs/Shot.js');


var Ship = function(state, game, shot) {
	this.TAG='Ship ';
	console.log(this.TAG+'constructor');
	this.game = game; this.state = state; this.factories = this.state.factories;
	Phaser.Sprite.call(this, game, this.state.grid.placedShip.x, this.state.grid.placedShip.y, 'ship');
	this.shot = shot;
	this.game.physics.enable(this, Phaser.Physics.ARCADE);
	this.smoothed = false;
	this.game.add.existing(this);
	this.anchor.setTo(0.5, 0.5);
	//this.scale.setTo(1.35, 1.35);
	this.speed = 125;
	this.z = 100;
	this.cursors = this.game.input.keyboard.createCursorKeys();
  this.shotTimer = this.game.time.events.loop(150, this.fire, this);
	this.fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
	this.body.collideWorldBounds = true;
	this.checkWorldBounds = true;

	this.animations.add('flash', [0, 1], 8, true);

	this.pointer = this.game.add.sprite(this.x, this.y, 'pointer');
	this.pointer.pAngle = 0;
	this.pointer.fixedToCamera = true;
	this.pointer.alpha = 0.5;
	this.pointer.cameraOffset.setTo(25, 25);
	this.pointer.scale.setTo(2, 2);
	this.pointer.anchor.setTo(0.5, 0.5);
	this.pointer.smoothed = false;

	// make god mode for initial start
	this.setGod();
};


Ship.prototype = Object.create(Phaser.Sprite.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.setGod = function(){
	this.isGod = true;
	this.animations.play('flash');
	this.godTimer = this.game.time.events.add(2500, function(){
		this.game.time.events.remove(this.godTimer);
		this.isGod = false;
		this.animations.stop('flash');
		this.frame = 0;
		this.state.huds.msgText.visible = false;
	}, this);
};

Ship.prototype.fire = function(){
	if (!this.alive) return;
	if (this.fireButton.isDown){
		this.shot.fire(this.x, this.y, this.angle);
	}
};

Ship.prototype.enemyCollisionHandler = function(ship, enemy){
	for(var col = -1; col < 2; col++){
		for(var row = -1; row < 2; row++){
			this.state.explosions.generate(this.x + (row * 32), this.y + (col * 32));
		}
	}
	this.state.shipExp.stop();
	this.state.shipExp.play();
	this.kill();
	this.pointer.visible = false;
	window.gdata.ships--;
	this.state.huds.update();
	if (window.gdata.ships == 0){
		this.state.huds.setText("Mission Failed");
		this.state.huds.msgText.visible = true;
		this.state.game.time.events.add(2500, this.state.gameOver, this.state);
	} else {
		this.state.huds.msgText.visible = true;
	 	this.state.game.time.events.add(2500, function(){
			this.ship.reset(this.ship.x, this.ship.y);
			this.ship.pointer.visible = true;
			this.ship.setGod();
	 	}, this.state);
	}
};

Ship.prototype.setPointer = function(){
	if (!this.pointer.visible) return;
	var angle = 0;
	var distMin = 100000;
	this.pointer.tint = 0xffffff;
	if (this.factories.countLiving() == 0) this.pointer.visible = false;
	for(var i = 0; i < this.factories.length; i++){
		var factory = this.factories.getAt(i);
		if (factory.alive  && factory.body.enable){
			var distance = Phaser.Point.distance(this, factory, true);
			if (distance < distMin){
				distMin = distance;
				angle = this.game.physics.arcade.angleToXY(this, factory.x, factory.y, true);
			}
		}
	}
	if (this.state.bonus.alive){
		var distance = Phaser.Point.distance(this, this.state.bonus, true);
		if (distance < distMin){
			distMin = distance;
			angle = this.game.physics.arcade.angleToXY(this, this.state.bonus.x, this.state.bonus.y, true);
			this.pointer.tint = 0xff0000;
		}
	}
	this.pointer.angle = Math.round(Phaser.Math.radToDeg(angle));

};

Ship.prototype.update = function() {
	if (!this.alive) return;
	this.setPointer();

	if (this.cursors.right.isDown) {
		this.body.velocity.setTo(this.speed, 0);
		this.angle = 0;
	} else 	if (this.cursors.down.isDown) {
		this.body.velocity.setTo(0, this.speed);
		this.angle = 90;
	} else if (this.cursors.left.isDown) {
		this.body.velocity.setTo(-this.speed, 0);
		this.angle = 180;
	} else if (this.cursors.up.isDown) {
		this.body.velocity.setTo(0, -this.speed);
		this.angle = 270;
	}

	if (this.cursors.right.isDown && this.cursors.down.isDown){
		this.body.velocity.setTo(this.speed, this.speed);
		this.angle = 45;
	} else 	if (this.cursors.left.isDown && this.cursors.down.isDown) {
		this.body.velocity.setTo(-this.speed, this.speed);
		this.angle = 135;
	} else if (this.cursors.left.isDown && this.cursors.up.isDown) {
		this.body.velocity.setTo(-this.speed, -this.speed);
		this.angle = 225;
	} else if (this.cursors.up.isDown && this.cursors.right.isDown) {
		this.body.velocity.setTo(this.speed, -this.speed);
		this.angle = 315;
	}


};

module.exports = Ship;

},{"../prefabs/Shot.js":15}],15:[function(require,module,exports){
'use strict';

var Shot = function(state, game) {
  this.TAG = "Shot ";
  console.log(this.TAG+'constructor');
  this.game = game; this.state = state;
  Phaser.Group.call(this, this.game, 'shot', false, true, Phaser.Physics.ARCADE);
  this.game.add.existing(this);
  this.speed = 600;

  this.tintColor = 0x0000ff;

  // shots
  this.createMultiple(20, 'shot', 0, true);
  this.setAll('alive', false); this.setAll('visible', false);
  this.setAll('autoCull', true);
  this.setAll('outOfCameraBoundsKill', true);
  this.setAll('anchor.x', 0.5); this.setAll('anchor.y', 0.5);
  this.setAll('scale.x', 1.5); this.setAll('scale.y', 1.5);

};

Shot.prototype = Object.create(Phaser.Group.prototype);
Shot.prototype.constructor = Shot;

Shot.prototype.collisionHandler = function(shot, enemy){
  shot.kill();
  enemy.hit();
};


Shot.prototype.fire = function(fx, fy, fa){
  if (this.state.shipShot.isPlaying) this.state.shipShot.stop();
  this.state.shipShot.play();


  switch(window.gdata.fireMode){
    case Const.SINGLE:
      this.tintColor = "0xff00ff";
      this.shoot(fx, fy, fa);
      break;
    case Const.DOUBLE:
      this.tintColor = "0x0000ff";
      this.shoot(fx, fy, fa - 2);
      this.shoot(fx, fy, fa + 2);
      break;
    case Const.TRIPLE:
      if (this.countDead() >= 3){
        this.tintColor = "0xff0000";
        this.shoot(fx, fy, fa - 5);
        this.shoot(fx, fy, fa);
        this.shoot(fx, fy, fa + 5);
      }
      break;
  }
};

Shot.prototype.shoot = function(fx, fy, angle){
  var shot = this.getFirstDead();
  if (shot == null) return;
  shot.reset(fx, fy);
  shot.angle = angle;
  this.game.physics.enable(shot, Phaser.Physics.ARCADE);
  shot.frame = 0;
  shot.visible = true;
  this.game.physics.arcade.velocityFromAngle(angle, this.speed, shot.body.velocity);
  shot.tint = this.tintColor;
};


// 122500 + 50625 = 173125 = 416
Shot.prototype.update = function() {
  // kill shots based on distance from ship
  // this.forEachAlive(
  //   function(shot, ship){
  //     var distance = Phaser.Point.distance(shot, ship, true);
  //     if (distance > 416) shot.kill();
  //   },
  //   this,
  //   this.ship
  // );
};

module.exports = Shot;

},{}],16:[function(require,module,exports){
'use strict';

var Silo = function(state) {
  this.state = state;
  this.game = state.game;
  Phaser.Sprite.call(this, this.game, 100, 100, 'silo');
	this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.game.add.existing(this);
  this.anchor.setTo(0.5, 0.5);
  this.frame = 0;
  this.timer = null;
  this.animations.add('open', [1,2,3], 5, false);
  this.animations.add('close', [3,2,1,0], 5, false);
  this.width = 38; this.height=38;

};

Silo.prototype = Object.create(Phaser.Sprite.prototype);
Silo.prototype.constructor = Silo;

Silo.prototype.closeAnim = function(){
  var a = Phaser.Math.radToDeg(this.game.physics.arcade.angleToXY(this, this.state.ship.x, this.state.ship.y));
  this.state.eshots.fire(this.x, this.y, a, 180, Const.ESHOT1);
  var anim = this.animations.play('close');
  anim.onComplete.addOnce(function(){ this.timer = null; }, this);
};

Silo.prototype.openAnim = function(){
  if (this.game.rnd.integerInRange(0, 50) < 10){
    var anim = this.animations.play('open');
    anim.onComplete.addOnce(this.closeAnim, this);
  } else this.timer = null;
};

Silo.prototype.update = function() {
  if (this.inCamera && !this.state.ship.isGod){
    if (this.timer == null){
      this.timer = this.game.time.events.add(50, this.openAnim, this);
    }
  }
};

Silo.prototype.hit = function(){
  this.health--;
  this.state.hitfx.stop();
  this.state.hitfx.play();
  if (this.health <= 0) {
    this.state.explosions.generate(this.x, this.y);
    this.state.groundExp.stop();
    this.state.groundExp.play();
    window.gdata.credits = window.gdata.credits + 35;
    this.state.huds.update();
    if (this.timer != null) this.game.time.events.remove(this.timer);
    this.kill();
  }
};

module.exports = Silo;

},{}],17:[function(require,module,exports){
'use strict';

var Silo = require('../prefabs/Silo.js');

var Silos = function(state, game){
  this.state = state; this.game = game;
  Phaser.Group.call(this, this.game, 'Silos', false, true, Phaser.Physics.ARCADE);
  this.game.add.existing(this);
};

Silos.prototype = Object.create(Phaser.Group.prototype);
Silos.prototype.constructor = Silos;

Silos.prototype.generate = function(x, y){
  var s = new Silo(this.state, this.game);
  s.x = x; s.y = y;
  this.add(s);
};

module.exports = Silos;

},{"../prefabs/Silo.js":16}],18:[function(require,module,exports){
'use strict';

var Truck = function(state, type, dir) {
  this.state = state;
  this.game = state.game;
  Phaser.Sprite.call(this, this.game, 0, 0, 'truck');
	this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.speed = 100;
  this.game.add.existing(this);
  this.anchor.setTo(0.5, 0.5);
  this.health = 5;
  this.frame = this.game.rnd.integerInRange(0, 1);
  this.angle = dir;
  this.type = type;

  if (type == 2){
      this.game.physics.arcade.velocityFromAngle(dir, this.speed, this.body.velocity);
  }
};

Truck.prototype = Object.create(Phaser.Sprite.prototype);
Truck.prototype.constructor = Truck;

Truck.prototype.update = function() {
  if (this.alive){
    if (this.x > this.game.world.width + this.width) this.x -= this.game.world.width + this.width;
    if (this.x < -this.width) this.x += this.game.world.width + this.width;
    if (this.y > this.game.world.width + this.height) this.y -= this.game.world.height + this.height;
    if (this.y < -this.height) this.y += this.game.world.height + this.height;
  }
};

Truck.prototype.hit = function(){
  this.health--;
  this.state.hitfx.stop();
  this.state.hitfx.play();

  if (this.health <= 0) {
    this.state.explosions.generate(this.x, this.y);
    this.state.groundExp.stop();
    this.state.groundExp.play();
    window.gdata.credits = window.gdata.credits + this.game.rnd.integerInRange(15, 50);
    this.state.huds.update();
    if (this.timer != null) this.game.time.events.remove(this.timer);
    this.kill();
  }
};

module.exports = Truck;

},{}],19:[function(require,module,exports){
'use strict';

var Truck = require('../prefabs/Truck.js');


var Trucks = function(state, game){
  this.state = state; this.game = game;
  Phaser.Group.call(this, this.game, 'Trucks', false, true, Phaser.Physics.ARCADE);
  this.game.add.existing(this);
};

Trucks.prototype = Object.create(Phaser.Group.prototype);
Trucks.prototype.constructor = Trucks;

Trucks.prototype.generate = function(x, y, type, dir){
  var s = new Truck(this.state, type, dir);
  s.x = x; s.y = y;
  this.add(s);
  return s;
};

module.exports = Trucks;

},{"../prefabs/Truck.js":18}],20:[function(require,module,exports){
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

    // game constants
    window.Const = {
      ESHOT1: 1,
      ESHOT2: 2,
      EMISSILE: 3,
      FMISSILE: 4,
      FSHOOT: 5,
      NONE: 6,
      SINGLE: 10,
      DOUBLE: 11,
      TRIPLE: 12,
      HIT: 13,
      PICKUP: 14,
      FREESHIP: 15,
      FACTORYMAX: 50,
      FACTORYINC: Math.round(0.25 * 50)
    };

  }
};

module.exports = Boot;

},{}],21:[function(require,module,exports){

'use strict';
function GameOver() {}

GameOver.prototype = {
  preload: function () {

  },
  create: function () {
    var txt = "Game Over"
    this.titleStyle = {fill:"#ff0000", stroke:"#000000", strokeThickness:2, font:"bold 40px Arial", align: "center"};
    this.titleText = this.game.add.text(this.game.width/2, this.game.height/2 - 100, txt, this.titleStyle);
    this.titleText.anchor.setTo(0.5, 0.5);
    this.game.stage.backgroundColor = '#0044ff';

    var msg = "\nThe Brave Eco Warrior has Fallen! Without you is the world now doomed to destruction?\n" +
    "Never loose hope! Another Brave Warrior will rise to take their place";

    this.msgStyle = {fill:"#ffffff", stroke:"#000000", strokeThickness:2, font:"bold 16px Arial", align: "center"};
    this.msgText = this.game.add.text(this.game.width/2, this.game.height/2, msg, this.msgStyle);
    this.msgText.anchor.setTo(0.5, 0.5);

    // reset game data
    window.gdata = null;

    this.game.time.events.add(6500, function(){
      window.gdata = null;
      this.game.state.start('menu');
    }, this);


  },

  update: function () {
  }

};


module.exports = GameOver;

},{}],22:[function(require,module,exports){
'use strict';

var LevelData = require('../classes/levelData.js');

function Level() {}

Level.prototype = {
  preload: function() {
  },

  create: function() {
    this.game.stage.backgroundColor = '#0044ff';
    var levelData = new LevelData();

    if (!window.gdata || window.gdata == null){
      window.gdata = {
        ships:3,
        fireMode: Const.SINGLE,
        credits:0,
        level:0,
        attackCloud: true,
        worldSize: 3,
        factories: 1,
        forestation: 0.3,
        lData:{}
      };

      window.gdata.lData = levelData.getLevel(window.gdata.level);
    } else {
      window.gdata.level++;
      if (window.gdata.level > levelData.levels.length) window.gdata.level = 0;
      window.gdata.lData = levelData.getLevel(window.gdata.level);
    }

    this.titleStyle = {fill:"#fe7301", stroke:"#000000", strokeThickness:2, font:"bold 40px Arial", align: "center"};
    this.titleText = this.game.add.text(this.game.width/2, this.game.height/2 - 100, window.gdata.lData.name, this.titleStyle);
    this.titleText.anchor.setTo(0.5, 0.5);
    this.msgStyle = {fill:"#ffffff", stroke:"#000000", strokeThickness:2, font:"bold 16px Arial", align: "center"};
    this.msgText = this.game.add.text(this.game.width/2, this.game.height/2 - 20, window.gdata.lData.description, this.msgStyle);
    this.msgText.anchor.setTo(0.5, 0.5);

    // this.startText = this.game.add.text(this.game.width/2, this.game.height/2 +100, "Press Any Key to get it on", this.msgStyle);
    // this.startText.fill = "#00ff00"; this.startText.fontSize = 25;
    // this.startText.anchor.setTo(0.5, 0.5);

    //this.beginLevel();
    //this.game.input.keyboard.callbackContext = this;
    //this.game.input.keyboard.onDownCallback = function(e){ this.beginLevel(); }
    this.game.time.events.add(5000, this.beginLevel, this);

  },

  update: function() {
  },

  beginLevel: function(){
    //this.game.input.keyboard.callbackContext = null;
    //this.game.input.keyboard.onDownCallback = null;
    this.game.state.start('play');
  }
};

module.exports = Level;

},{"../classes/levelData.js":3}],23:[function(require,module,exports){

'use strict';
function Menu() {}

Menu.prototype = {
  preload: function() {
  },

  create: function() {
    this.game.stage.backgroundColor = '#4444ff';

    // add animated clouds that float around the title but are behind it

    var titleStyle = { font: "bold 30pt Arial", fontWeight: "bold", align: "center",
        fill:"#FFFF00", stroke: "#005500", strokeThickness: 5};
    var title = this.game.add.text(this.game.width/2, this.game.height/2 - 150, "ECO WARRIOR", titleStyle);
    title.anchor.setTo(0.5, 0.5);

    var txt = "The world is going to crap - FIX IT!\n" +
    "Blast off in the Eco Ship and travel FAR AND WIDE and shut\n" +
    "down those factories that are pumping crap into the atmosphere\n" +
    "But be careful as governments aren't friendly towards you\n" +
    "affecting their economies! God speed Eco Warrior\n" +
    "Now Go Save the Planet\n\n\n\n" +
    "Controls: A - Fire, Cursor Keys - Fly Eco Ship";

    var msgStyle = { font: "16px Arial", fill:"#FFFFFF", align: "center"};
    var msg = this.game.add.text(this.game.width/2, this.game.height/2, txt, msgStyle);
    msg.anchor.setTo(0.5, 0.5);

    this.ship = this.game.add.sprite(this.game.width/2, 280, 'ship');
    this.ship.anchor.setTo(0.5, 0.5);
    this.game.physics.enable(this.ship, Phaser.Physics.ARCADE);
    this.ship.body.angularVelocity = 200;

    var vsgStyle = { font: "16px Arial", fill:"#FFFFFF", align: "center"};
    this.vsg = this.game.add.text(this.game.width/2, 360, "Press A to Start", vsgStyle);
    this.vsg.anchor.setTo(0.5, 0.5);

    this.game.time.events.loop(500, function(){
      this.vsg.visible = !this.vsg.visible;
    }, this);

    this.aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);

  },

  update: function() {
    if (this.aKey.isDown) { this.game.state.start('level'); }
  }
};

module.exports = Menu;

},{}],24:[function(require,module,exports){
  'use strict';


  var PF = require('pathfinding');
  var Grid = require('../classes/Grid.js');
  var Ship = require('../prefabs/Ship.js');
  var Factories = require('../prefabs/Factories.js');
  var Shot = require('../prefabs/Shot.js');
  var Clouds = require('../prefabs/Clouds.js');
  var Fighter = require('../prefabs/Fighter.js');
  var Huds = require('../classes/Huds.js');
  var Explosions = require('../prefabs/Explosions.js');
  var EShots = require('../prefabs/EShots.js');
  var Silos = require('../prefabs/Silos.js');
  var Trucks = require('../prefabs/Trucks.js');
  var Fighters = require('../prefabs/Fighters.js');
  var Bonus = require('../prefabs/Bonus.js');

  function Play() {}

  Play.prototype = {
    create: function() {
      this.game.physics.startSystem(Phaser.Physics.ARCADE);

      this.game.stage.backgroundColor = '#339933';
      this.complete = false;

      // audio
      this.shipShot = this.game.add.audio('shipShot', 0.3);
      this.groundExp = this.game.add.audio('groundExp');
      this.airExp = this.game.add.audio('airExp');
      this.shipExp = this.game.add.audio('shipExp');
      this.factoryExp = this.game.add.audio('factoryExp');
      this.hitfx = this.game.add.audio('hit');
      this.gasfx = this.game.add.audio('gas');
      this.eshot1fx = this.game.add.audio('eshot1fx');
      this.eshot2fx = this.game.add.audio('eshot2fx');
      this.bonusFx = this.game.add.audio('bonusFx');
      this.missileFx = this.game.add.audio('missileFx');


      // ground enemies
      this.roads = this.game.add.group();
      this.factories = new Factories(this, this.game);
      this.silos = new Silos(this, this.game);
      this.trucks = new Trucks(this, this.game);
      this.bonus = new Bonus(this);

      this.grid = new Grid(this, this.game);

      this.clouds = new Clouds(this, this.game);
      this.factories.addClouds(this.clouds);

      // explosions must be above ground enemies
      this.explosions = new Explosions(this, this.game);

      this.eshots = new EShots(this, this.game);

      this.fighters = new Fighters(this, this.game);

      this.shot = new Shot(this, this.game);
      this.ship = new Ship(this, this.game, this.shot);

      this.huds = new Huds(this, this.game);
      this.huds.update();

      this.shot.ship = this.ship;
      this.game.camera.follow(this.ship);
      this.ship.cameraOffset.setTo(this.game.width/2, this.game.height/2);

      this.game.camera.update();

      this.factories.state = this;
      this.clouds.state = this;
      this.shot.state = this;
      this.ship.state = this;
      this.eshots.state = this;
      this.silos.state = this;
      this.trucks.state = this;
      this.fighters.state = this;
      this.bonus.state = this;

      if (window.gdata.lData.fighters) this.fighters.generate(window.gdata.lData.fightersType);
      //this.grid.display();

    },

    update: function() {
      // check player death
      if (this.ship.alive && !this.ship.isGod){
        this.game.physics.arcade.overlap(this.ship, this.fighters, this.ship.enemyCollisionHandler, null, this.ship);
        this.game.physics.arcade.overlap(this.ship, this.clouds, this.ship.enemyCollisionHandler, null, this.ship);
        this.game.physics.arcade.overlap(this.ship, this.eshots.eshot1Group, this.ship.enemyCollisionHandler, null, this.ship);
        this.game.physics.arcade.overlap(this.ship, this.eshots.eshot2Group, this.ship.enemyCollisionHandler, null, this.ship);
        this.game.physics.arcade.overlap(this.ship, this.eshots.emissileGroup, this.ship.enemyCollisionHandler, null, this.ship);
      }

      // check player pickups
      this.game.physics.arcade.overlap(this.shot, this.bonus, this.bonus.hit, null, this.bonus);
      this.game.physics.arcade.overlap(this.ship, this.bonus, this.bonus.pickup, null, this.bonus);

      // check shot hits
      this.game.physics.arcade.overlap(this.shot, this.fighters, this.shot.collisionHandler, null, this);
      this.game.physics.arcade.overlap(this.shot, this.trucks, this.shot.collisionHandler, null, this);
      this.game.physics.arcade.overlap(this.shot, this.silos, this.shot.collisionHandler, null, this);
      this.game.physics.arcade.overlap(this.shot, this.factories, this.shot.collisionHandler, null, this);
      this.game.physics.arcade.overlap(this.shot, this.clouds, this.shot.collisionHandler, null, this);
      this.game.physics.arcade.overlap(this.shot, this.eshots.emissileGroup, this.shot.collisionHandler, null, this);

      // check level complete condition
      var numFactories = this.factories.filter(function(child, index, children){
        return child.health > 0 ? true : false;
      }, true);

      if (numFactories.total <= 0 && this.complete == false && this.ship.alive){
        this.ship.isGod = true;
        this.complete = true;
        this.game.time.events.removeAll();
        this.game.time.events.add(1500, this.levelComplete, this);
      }

    },

    levelComplete: function(){
      this.game.state.start('level');
    },

    gameOver: function() {
      this.game.state.start('gameover');
    },

    render: function(){
      // this.game.debug.spriteInfo(this.fighter, 32, 32);
      // this.game.debug.spriteInfo(this.ship, 32, 140);
      // this.game.debug.cameraInfo(this.game.camera, 32, 240);
    }
  };

  module.exports = Play;

},{"../classes/Grid.js":1,"../classes/Huds.js":2,"../prefabs/Bonus.js":5,"../prefabs/Clouds.js":7,"../prefabs/EShots.js":8,"../prefabs/Explosions.js":9,"../prefabs/Factories.js":10,"../prefabs/Fighter.js":12,"../prefabs/Fighters.js":13,"../prefabs/Ship.js":14,"../prefabs/Shot.js":15,"../prefabs/Silos.js":17,"../prefabs/Trucks.js":19,"pathfinding":26}],25:[function(require,module,exports){

'use strict';
function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {

  preload: function(){
    this.ready = false;
  },

  create: function() {
    console.log('preload state');
    this.load.onFileComplete.add(this.fileComplete, this);
    this.load.onLoadComplete.addOnce(this.loadComplete, this);

    this.game.stage.backgroundColor = "#000000";
    this.loadText = this.game.add.text(this.game.width/2, this.game.height/2, "Loading ...", { fill: '#ffffff' });
    this.loadText.anchor.setTo(0.5, 0.5);
    this.start();

  },

  start: function(){
    // graphics
    this.load.spritesheet('ship', 'assets/sprites/ship.png', 36, 36);
    this.load.spritesheet('factory', 'assets/sprites/factory.png', 144, 144);
    this.load.image('shot', 'assets/sprites/shot.png');
    this.load.spritesheet('cloud', 'assets/sprites/cloud.png', 32, 32);
    this.load.spritesheet('terrain', 'assets/terrain/terrain.png', 48, 48);
    this.load.spritesheet('road', 'assets/terrain/road.png', 48, 48);
    this.load.spritesheet('explosion', 'assets/sprites/explosion.png', 32, 32);
    this.load.image('pointer', 'assets/sprites/pointer.png');
    this.load.spritesheet('fighter', 'assets/sprites/fighter.png', 52, 44);
    this.load.spritesheet('eshot1', 'assets/sprites/eshot1.png', 14, 14);
    this.load.spritesheet('eshot2', 'assets/sprites/eshot2.png', 32, 16);
    this.load.spritesheet('emissile', 'assets/sprites/emissile.png', 32, 14);
    this.load.spritesheet('silo', 'assets/sprites/silo.png', 32, 32);
    this.load.spritesheet('truck', 'assets/sprites/trucks.png', 70, 40);
    this.load.spritesheet('bonus', 'assets/sprites/bonus.png', 48, 44);

    // sfx
    this.load.audio('shipShot', 'assets/sfx/shipShot.wav');
    this.load.audio('airExp', 'assets/sfx/airExp.wav');
    this.load.audio('groundExp', 'assets/sfx/groundExp.wav');
    this.load.audio('factoryExp', 'assets/sfx/factoryExp.wav');
    this.load.audio('shipExp', 'assets/sfx/shipExp.wav');
    this.load.audio('hit', 'assets/sfx/hit.wav');
    this.load.audio('gas', 'assets/sfx/gas.wav');
    this.load.audio('eshot1fx', 'assets/sfx/eshot1.wav');
    this.load.audio('eshot2fx', 'assets/sfx/eshot2.wav');
    this.load.audio('bonusFx', 'assets/sfx/bonus.wav');
    this.load.audio('missileFx', 'assets/sfx/missile.wav');

    this.game.load.start();

	},

  update: function() {
    if(!!this.ready) {
      this.game.state.start('menu');
    }
  },

  fileComplete: function(progress, cachekey, success, totalLoaded, totalFiles){
    this.loadText.setText("Loading ... " + progress + "%");
  },

  loadComplete: function() {
    this.loadText.setText("Loading complete");
    this.ready = true;
  }
};

module.exports = Preload;

},{}],26:[function(require,module,exports){
module.exports = require('./src/PathFinding');

},{"./src/PathFinding":29}],27:[function(require,module,exports){
module.exports = require('./lib/heap');

},{"./lib/heap":28}],28:[function(require,module,exports){
// Generated by CoffeeScript 1.8.0
(function() {
  var Heap, defaultCmp, floor, heapify, heappop, heappush, heappushpop, heapreplace, insort, min, nlargest, nsmallest, updateItem, _siftdown, _siftup;

  floor = Math.floor, min = Math.min;


  /*
  Default comparison function to be used
   */

  defaultCmp = function(x, y) {
    if (x < y) {
      return -1;
    }
    if (x > y) {
      return 1;
    }
    return 0;
  };


  /*
  Insert item x in list a, and keep it sorted assuming a is sorted.
  
  If x is already in a, insert it to the right of the rightmost x.
  
  Optional args lo (default 0) and hi (default a.length) bound the slice
  of a to be searched.
   */

  insort = function(a, x, lo, hi, cmp) {
    var mid;
    if (lo == null) {
      lo = 0;
    }
    if (cmp == null) {
      cmp = defaultCmp;
    }
    if (lo < 0) {
      throw new Error('lo must be non-negative');
    }
    if (hi == null) {
      hi = a.length;
    }
    while (lo < hi) {
      mid = floor((lo + hi) / 2);
      if (cmp(x, a[mid]) < 0) {
        hi = mid;
      } else {
        lo = mid + 1;
      }
    }
    return ([].splice.apply(a, [lo, lo - lo].concat(x)), x);
  };


  /*
  Push item onto heap, maintaining the heap invariant.
   */

  heappush = function(array, item, cmp) {
    if (cmp == null) {
      cmp = defaultCmp;
    }
    array.push(item);
    return _siftdown(array, 0, array.length - 1, cmp);
  };


  /*
  Pop the smallest item off the heap, maintaining the heap invariant.
   */

  heappop = function(array, cmp) {
    var lastelt, returnitem;
    if (cmp == null) {
      cmp = defaultCmp;
    }
    lastelt = array.pop();
    if (array.length) {
      returnitem = array[0];
      array[0] = lastelt;
      _siftup(array, 0, cmp);
    } else {
      returnitem = lastelt;
    }
    return returnitem;
  };


  /*
  Pop and return the current smallest value, and add the new item.
  
  This is more efficient than heappop() followed by heappush(), and can be
  more appropriate when using a fixed size heap. Note that the value
  returned may be larger than item! That constrains reasonable use of
  this routine unless written as part of a conditional replacement:
      if item > array[0]
        item = heapreplace(array, item)
   */

  heapreplace = function(array, item, cmp) {
    var returnitem;
    if (cmp == null) {
      cmp = defaultCmp;
    }
    returnitem = array[0];
    array[0] = item;
    _siftup(array, 0, cmp);
    return returnitem;
  };


  /*
  Fast version of a heappush followed by a heappop.
   */

  heappushpop = function(array, item, cmp) {
    var _ref;
    if (cmp == null) {
      cmp = defaultCmp;
    }
    if (array.length && cmp(array[0], item) < 0) {
      _ref = [array[0], item], item = _ref[0], array[0] = _ref[1];
      _siftup(array, 0, cmp);
    }
    return item;
  };


  /*
  Transform list into a heap, in-place, in O(array.length) time.
   */

  heapify = function(array, cmp) {
    var i, _i, _j, _len, _ref, _ref1, _results, _results1;
    if (cmp == null) {
      cmp = defaultCmp;
    }
    _ref1 = (function() {
      _results1 = [];
      for (var _j = 0, _ref = floor(array.length / 2); 0 <= _ref ? _j < _ref : _j > _ref; 0 <= _ref ? _j++ : _j--){ _results1.push(_j); }
      return _results1;
    }).apply(this).reverse();
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      i = _ref1[_i];
      _results.push(_siftup(array, i, cmp));
    }
    return _results;
  };


  /*
  Update the position of the given item in the heap.
  This function should be called every time the item is being modified.
   */

  updateItem = function(array, item, cmp) {
    var pos;
    if (cmp == null) {
      cmp = defaultCmp;
    }
    pos = array.indexOf(item);
    if (pos === -1) {
      return;
    }
    _siftdown(array, 0, pos, cmp);
    return _siftup(array, pos, cmp);
  };


  /*
  Find the n largest elements in a dataset.
   */

  nlargest = function(array, n, cmp) {
    var elem, result, _i, _len, _ref;
    if (cmp == null) {
      cmp = defaultCmp;
    }
    result = array.slice(0, n);
    if (!result.length) {
      return result;
    }
    heapify(result, cmp);
    _ref = array.slice(n);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      elem = _ref[_i];
      heappushpop(result, elem, cmp);
    }
    return result.sort(cmp).reverse();
  };


  /*
  Find the n smallest elements in a dataset.
   */

  nsmallest = function(array, n, cmp) {
    var elem, i, los, result, _i, _j, _len, _ref, _ref1, _results;
    if (cmp == null) {
      cmp = defaultCmp;
    }
    if (n * 10 <= array.length) {
      result = array.slice(0, n).sort(cmp);
      if (!result.length) {
        return result;
      }
      los = result[result.length - 1];
      _ref = array.slice(n);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        elem = _ref[_i];
        if (cmp(elem, los) < 0) {
          insort(result, elem, 0, null, cmp);
          result.pop();
          los = result[result.length - 1];
        }
      }
      return result;
    }
    heapify(array, cmp);
    _results = [];
    for (i = _j = 0, _ref1 = min(n, array.length); 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
      _results.push(heappop(array, cmp));
    }
    return _results;
  };

  _siftdown = function(array, startpos, pos, cmp) {
    var newitem, parent, parentpos;
    if (cmp == null) {
      cmp = defaultCmp;
    }
    newitem = array[pos];
    while (pos > startpos) {
      parentpos = (pos - 1) >> 1;
      parent = array[parentpos];
      if (cmp(newitem, parent) < 0) {
        array[pos] = parent;
        pos = parentpos;
        continue;
      }
      break;
    }
    return array[pos] = newitem;
  };

  _siftup = function(array, pos, cmp) {
    var childpos, endpos, newitem, rightpos, startpos;
    if (cmp == null) {
      cmp = defaultCmp;
    }
    endpos = array.length;
    startpos = pos;
    newitem = array[pos];
    childpos = 2 * pos + 1;
    while (childpos < endpos) {
      rightpos = childpos + 1;
      if (rightpos < endpos && !(cmp(array[childpos], array[rightpos]) < 0)) {
        childpos = rightpos;
      }
      array[pos] = array[childpos];
      pos = childpos;
      childpos = 2 * pos + 1;
    }
    array[pos] = newitem;
    return _siftdown(array, startpos, pos, cmp);
  };

  Heap = (function() {
    Heap.push = heappush;

    Heap.pop = heappop;

    Heap.replace = heapreplace;

    Heap.pushpop = heappushpop;

    Heap.heapify = heapify;

    Heap.updateItem = updateItem;

    Heap.nlargest = nlargest;

    Heap.nsmallest = nsmallest;

    function Heap(cmp) {
      this.cmp = cmp != null ? cmp : defaultCmp;
      this.nodes = [];
    }

    Heap.prototype.push = function(x) {
      return heappush(this.nodes, x, this.cmp);
    };

    Heap.prototype.pop = function() {
      return heappop(this.nodes, this.cmp);
    };

    Heap.prototype.peek = function() {
      return this.nodes[0];
    };

    Heap.prototype.contains = function(x) {
      return this.nodes.indexOf(x) !== -1;
    };

    Heap.prototype.replace = function(x) {
      return heapreplace(this.nodes, x, this.cmp);
    };

    Heap.prototype.pushpop = function(x) {
      return heappushpop(this.nodes, x, this.cmp);
    };

    Heap.prototype.heapify = function() {
      return heapify(this.nodes, this.cmp);
    };

    Heap.prototype.updateItem = function(x) {
      return updateItem(this.nodes, x, this.cmp);
    };

    Heap.prototype.clear = function() {
      return this.nodes = [];
    };

    Heap.prototype.empty = function() {
      return this.nodes.length === 0;
    };

    Heap.prototype.size = function() {
      return this.nodes.length;
    };

    Heap.prototype.clone = function() {
      var heap;
      heap = new Heap();
      heap.nodes = this.nodes.slice(0);
      return heap;
    };

    Heap.prototype.toArray = function() {
      return this.nodes.slice(0);
    };

    Heap.prototype.insert = Heap.prototype.push;

    Heap.prototype.top = Heap.prototype.peek;

    Heap.prototype.front = Heap.prototype.peek;

    Heap.prototype.has = Heap.prototype.contains;

    Heap.prototype.copy = Heap.prototype.clone;

    return Heap;

  })();

  if (typeof module !== "undefined" && module !== null ? module.exports : void 0) {
    module.exports = Heap;
  } else {
    window.Heap = Heap;
  }

}).call(this);

},{}],29:[function(require,module,exports){
module.exports = {
    'Heap'                      : require('heap'),
    'Node'                      : require('./core/Node'),
    'Grid'                      : require('./core/Grid'),
    'Util'                      : require('./core/Util'),
    'DiagonalMovement'          : require('./core/DiagonalMovement'),
    'Heuristic'                 : require('./core/Heuristic'),
    'AStarFinder'               : require('./finders/AStarFinder'),
    'BestFirstFinder'           : require('./finders/BestFirstFinder'),
    'BreadthFirstFinder'        : require('./finders/BreadthFirstFinder'),
    'DijkstraFinder'            : require('./finders/DijkstraFinder'),
    'BiAStarFinder'             : require('./finders/BiAStarFinder'),
    'BiBestFirstFinder'         : require('./finders/BiBestFirstFinder'),
    'BiBreadthFirstFinder'      : require('./finders/BiBreadthFirstFinder'),
    'BiDijkstraFinder'          : require('./finders/BiDijkstraFinder'),
    'IDAStarFinder'             : require('./finders/IDAStarFinder'),
    'JumpPointFinder'           : require('./finders/JumpPointFinder'),
};

},{"./core/DiagonalMovement":30,"./core/Grid":31,"./core/Heuristic":32,"./core/Node":33,"./core/Util":34,"./finders/AStarFinder":35,"./finders/BestFirstFinder":36,"./finders/BiAStarFinder":37,"./finders/BiBestFirstFinder":38,"./finders/BiBreadthFirstFinder":39,"./finders/BiDijkstraFinder":40,"./finders/BreadthFirstFinder":41,"./finders/DijkstraFinder":42,"./finders/IDAStarFinder":43,"./finders/JumpPointFinder":48,"heap":27}],30:[function(require,module,exports){
var DiagonalMovement = {
    Always: 1,
    Never: 2,
    IfAtMostOneObstacle: 3,
    OnlyWhenNoObstacles: 4
};

module.exports = DiagonalMovement;
},{}],31:[function(require,module,exports){
var Node = require('./Node');
var DiagonalMovement = require('./DiagonalMovement');

/**
 * The Grid class, which serves as the encapsulation of the layout of the nodes.
 * @constructor
 * @param {number|Array<Array<(number|boolean)>>} width_or_matrix Number of columns of the grid, or matrix
 * @param {number} height Number of rows of the grid.
 * @param {Array<Array<(number|boolean)>>} [matrix] - A 0-1 matrix
 *     representing the walkable status of the nodes(0 or false for walkable).
 *     If the matrix is not supplied, all the nodes will be walkable.  */
function Grid(width_or_matrix, height, matrix) {
    var width;

    if (typeof width_or_matrix !== 'object') {
        width = width_or_matrix;
    } else {
        height = width_or_matrix.length;
        width = width_or_matrix[0].length;
        matrix = width_or_matrix;
    }

    /**
     * The number of columns of the grid.
     * @type number
     */
    this.width = width;
    /**
     * The number of rows of the grid.
     * @type number
     */
    this.height = height;

    /**
     * A 2D array of nodes.
     */
    this.nodes = this._buildNodes(width, height, matrix);
}

/**
 * Build and return the nodes.
 * @private
 * @param {number} width
 * @param {number} height
 * @param {Array<Array<number|boolean>>} [matrix] - A 0-1 matrix representing
 *     the walkable status of the nodes.
 * @see Grid
 */
Grid.prototype._buildNodes = function(width, height, matrix) {
    var i, j,
        nodes = new Array(height);

    for (i = 0; i < height; ++i) {
        nodes[i] = new Array(width);
        for (j = 0; j < width; ++j) {
            nodes[i][j] = new Node(j, i);
        }
    }


    if (matrix === undefined) {
        return nodes;
    }

    if (matrix.length !== height || matrix[0].length !== width) {
        throw new Error('Matrix size does not fit');
    }

    for (i = 0; i < height; ++i) {
        for (j = 0; j < width; ++j) {
            if (matrix[i][j]) {
                // 0, false, null will be walkable
                // while others will be un-walkable
                nodes[i][j].walkable = false;
            }
        }
    }

    return nodes;
};


Grid.prototype.getNodeAt = function(x, y) {
    return this.nodes[y][x];
};


/**
 * Determine whether the node at the given position is walkable.
 * (Also returns false if the position is outside the grid.)
 * @param {number} x - The x coordinate of the node.
 * @param {number} y - The y coordinate of the node.
 * @return {boolean} - The walkability of the node.
 */
Grid.prototype.isWalkableAt = function(x, y) {
    return this.isInside(x, y) && this.nodes[y][x].walkable;
};


/**
 * Determine whether the position is inside the grid.
 * XXX: `grid.isInside(x, y)` is wierd to read.
 * It should be `(x, y) is inside grid`, but I failed to find a better
 * name for this method.
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
Grid.prototype.isInside = function(x, y) {
    return (x >= 0 && x < this.width) && (y >= 0 && y < this.height);
};


/**
 * Set whether the node on the given position is walkable.
 * NOTE: throws exception if the coordinate is not inside the grid.
 * @param {number} x - The x coordinate of the node.
 * @param {number} y - The y coordinate of the node.
 * @param {boolean} walkable - Whether the position is walkable.
 */
Grid.prototype.setWalkableAt = function(x, y, walkable) {
    this.nodes[y][x].walkable = walkable;
};


/**
 * Get the neighbors of the given node.
 *
 *     offsets      diagonalOffsets:
 *  +---+---+---+    +---+---+---+
 *  |   | 0 |   |    | 0 |   | 1 |
 *  +---+---+---+    +---+---+---+
 *  | 3 |   | 1 |    |   |   |   |
 *  +---+---+---+    +---+---+---+
 *  |   | 2 |   |    | 3 |   | 2 |
 *  +---+---+---+    +---+---+---+
 *
 *  When allowDiagonal is true, if offsets[i] is valid, then
 *  diagonalOffsets[i] and
 *  diagonalOffsets[(i + 1) % 4] is valid.
 * @param {Node} node
 * @param {DiagonalMovement} diagonalMovement
 */
Grid.prototype.getNeighbors = function(node, diagonalMovement) {
    var x = node.x,
        y = node.y,
        neighbors = [],
        s0 = false, d0 = false,
        s1 = false, d1 = false,
        s2 = false, d2 = false,
        s3 = false, d3 = false,
        nodes = this.nodes;

    // ↑
    if (this.isWalkableAt(x, y - 1)) {
        neighbors.push(nodes[y - 1][x]);
        s0 = true;
    }
    // →
    if (this.isWalkableAt(x + 1, y)) {
        neighbors.push(nodes[y][x + 1]);
        s1 = true;
    }
    // ↓
    if (this.isWalkableAt(x, y + 1)) {
        neighbors.push(nodes[y + 1][x]);
        s2 = true;
    }
    // ←
    if (this.isWalkableAt(x - 1, y)) {
        neighbors.push(nodes[y][x - 1]);
        s3 = true;
    }

    if (diagonalMovement === DiagonalMovement.Never) {
        return neighbors;
    }

    if (diagonalMovement === DiagonalMovement.OnlyWhenNoObstacles) {
        d0 = s3 && s0;
        d1 = s0 && s1;
        d2 = s1 && s2;
        d3 = s2 && s3;
    } else if (diagonalMovement === DiagonalMovement.IfAtMostOneObstacle) {
        d0 = s3 || s0;
        d1 = s0 || s1;
        d2 = s1 || s2;
        d3 = s2 || s3;
    } else if (diagonalMovement === DiagonalMovement.Always) {
        d0 = true;
        d1 = true;
        d2 = true;
        d3 = true;
    } else {
        throw new Error('Incorrect value of diagonalMovement');
    }

    // ↖
    if (d0 && this.isWalkableAt(x - 1, y - 1)) {
        neighbors.push(nodes[y - 1][x - 1]);
    }
    // ↗
    if (d1 && this.isWalkableAt(x + 1, y - 1)) {
        neighbors.push(nodes[y - 1][x + 1]);
    }
    // ↘
    if (d2 && this.isWalkableAt(x + 1, y + 1)) {
        neighbors.push(nodes[y + 1][x + 1]);
    }
    // ↙
    if (d3 && this.isWalkableAt(x - 1, y + 1)) {
        neighbors.push(nodes[y + 1][x - 1]);
    }

    return neighbors;
};


/**
 * Get a clone of this grid.
 * @return {Grid} Cloned grid.
 */
Grid.prototype.clone = function() {
    var i, j,

        width = this.width,
        height = this.height,
        thisNodes = this.nodes,

        newGrid = new Grid(width, height),
        newNodes = new Array(height);

    for (i = 0; i < height; ++i) {
        newNodes[i] = new Array(width);
        for (j = 0; j < width; ++j) {
            newNodes[i][j] = new Node(j, i, thisNodes[i][j].walkable);
        }
    }

    newGrid.nodes = newNodes;

    return newGrid;
};

module.exports = Grid;

},{"./DiagonalMovement":30,"./Node":33}],32:[function(require,module,exports){
/**
 * @namespace PF.Heuristic
 * @description A collection of heuristic functions.
 */
module.exports = {

  /**
   * Manhattan distance.
   * @param {number} dx - Difference in x.
   * @param {number} dy - Difference in y.
   * @return {number} dx + dy
   */
  manhattan: function(dx, dy) {
      return dx + dy;
  },

  /**
   * Euclidean distance.
   * @param {number} dx - Difference in x.
   * @param {number} dy - Difference in y.
   * @return {number} sqrt(dx * dx + dy * dy)
   */
  euclidean: function(dx, dy) {
      return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Octile distance.
   * @param {number} dx - Difference in x.
   * @param {number} dy - Difference in y.
   * @return {number} sqrt(dx * dx + dy * dy) for grids
   */
  octile: function(dx, dy) {
      var F = Math.SQRT2 - 1;
      return (dx < dy) ? F * dx + dy : F * dy + dx;
  },

  /**
   * Chebyshev distance.
   * @param {number} dx - Difference in x.
   * @param {number} dy - Difference in y.
   * @return {number} max(dx, dy)
   */
  chebyshev: function(dx, dy) {
      return Math.max(dx, dy);
  }

};

},{}],33:[function(require,module,exports){
/**
 * A node in grid. 
 * This class holds some basic information about a node and custom 
 * attributes may be added, depending on the algorithms' needs.
 * @constructor
 * @param {number} x - The x coordinate of the node on the grid.
 * @param {number} y - The y coordinate of the node on the grid.
 * @param {boolean} [walkable] - Whether this node is walkable.
 */
function Node(x, y, walkable) {
    /**
     * The x coordinate of the node on the grid.
     * @type number
     */
    this.x = x;
    /**
     * The y coordinate of the node on the grid.
     * @type number
     */
    this.y = y;
    /**
     * Whether this node can be walked through.
     * @type boolean
     */
    this.walkable = (walkable === undefined ? true : walkable);
}

module.exports = Node;

},{}],34:[function(require,module,exports){
/**
 * Backtrace according to the parent records and return the path.
 * (including both start and end nodes)
 * @param {Node} node End node
 * @return {Array<Array<number>>} the path
 */
function backtrace(node) {
    var path = [[node.x, node.y]];
    while (node.parent) {
        node = node.parent;
        path.push([node.x, node.y]);
    }
    return path.reverse();
}
exports.backtrace = backtrace;

/**
 * Backtrace from start and end node, and return the path.
 * (including both start and end nodes)
 * @param {Node}
 * @param {Node}
 */
function biBacktrace(nodeA, nodeB) {
    var pathA = backtrace(nodeA),
        pathB = backtrace(nodeB);
    return pathA.concat(pathB.reverse());
}
exports.biBacktrace = biBacktrace;

/**
 * Compute the length of the path.
 * @param {Array<Array<number>>} path The path
 * @return {number} The length of the path
 */
function pathLength(path) {
    var i, sum = 0, a, b, dx, dy;
    for (i = 1; i < path.length; ++i) {
        a = path[i - 1];
        b = path[i];
        dx = a[0] - b[0];
        dy = a[1] - b[1];
        sum += Math.sqrt(dx * dx + dy * dy);
    }
    return sum;
}
exports.pathLength = pathLength;


/**
 * Given the start and end coordinates, return all the coordinates lying
 * on the line formed by these coordinates, based on Bresenham's algorithm.
 * http://en.wikipedia.org/wiki/Bresenham's_line_algorithm#Simplification
 * @param {number} x0 Start x coordinate
 * @param {number} y0 Start y coordinate
 * @param {number} x1 End x coordinate
 * @param {number} y1 End y coordinate
 * @return {Array<Array<number>>} The coordinates on the line
 */
function interpolate(x0, y0, x1, y1) {
    var abs = Math.abs,
        line = [],
        sx, sy, dx, dy, err, e2;

    dx = abs(x1 - x0);
    dy = abs(y1 - y0);

    sx = (x0 < x1) ? 1 : -1;
    sy = (y0 < y1) ? 1 : -1;

    err = dx - dy;

    while (true) {
        line.push([x0, y0]);

        if (x0 === x1 && y0 === y1) {
            break;
        }
        
        e2 = 2 * err;
        if (e2 > -dy) {
            err = err - dy;
            x0 = x0 + sx;
        }
        if (e2 < dx) {
            err = err + dx;
            y0 = y0 + sy;
        }
    }

    return line;
}
exports.interpolate = interpolate;


/**
 * Given a compressed path, return a new path that has all the segments
 * in it interpolated.
 * @param {Array<Array<number>>} path The path
 * @return {Array<Array<number>>} expanded path
 */
function expandPath(path) {
    var expanded = [],
        len = path.length,
        coord0, coord1,
        interpolated,
        interpolatedLen,
        i, j;

    if (len < 2) {
        return expanded;
    }

    for (i = 0; i < len - 1; ++i) {
        coord0 = path[i];
        coord1 = path[i + 1];

        interpolated = interpolate(coord0[0], coord0[1], coord1[0], coord1[1]);
        interpolatedLen = interpolated.length;
        for (j = 0; j < interpolatedLen - 1; ++j) {
            expanded.push(interpolated[j]);
        }
    }
    expanded.push(path[len - 1]);

    return expanded;
}
exports.expandPath = expandPath;


/**
 * Smoothen the give path.
 * The original path will not be modified; a new path will be returned.
 * @param {PF.Grid} grid
 * @param {Array<Array<number>>} path The path
 */
function smoothenPath(grid, path) {
    var len = path.length,
        x0 = path[0][0],        // path start x
        y0 = path[0][1],        // path start y
        x1 = path[len - 1][0],  // path end x
        y1 = path[len - 1][1],  // path end y
        sx, sy,                 // current start coordinate
        ex, ey,                 // current end coordinate
        newPath,
        i, j, coord, line, testCoord, blocked;

    sx = x0;
    sy = y0;
    newPath = [[sx, sy]];

    for (i = 2; i < len; ++i) {
        coord = path[i];
        ex = coord[0];
        ey = coord[1];
        line = interpolate(sx, sy, ex, ey);

        blocked = false;
        for (j = 1; j < line.length; ++j) {
            testCoord = line[j];

            if (!grid.isWalkableAt(testCoord[0], testCoord[1])) {
                blocked = true;
                break;
            }
        }
        if (blocked) {
            lastValidCoord = path[i - 1];
            newPath.push(lastValidCoord);
            sx = lastValidCoord[0];
            sy = lastValidCoord[1];
        }
    }
    newPath.push([x1, y1]);

    return newPath;
}
exports.smoothenPath = smoothenPath;


/**
 * Compress a path, remove redundant nodes without altering the shape
 * The original path is not modified
 * @param {Array<Array<number>>} path The path
 * @return {Array<Array<number>>} The compressed path
 */
function compressPath(path) {

    // nothing to compress
    if(path.length < 3) {
        return path;
    }

    var compressed = [],
        sx = path[0][0], // start x
        sy = path[0][1], // start y
        px = path[1][0], // second point x
        py = path[1][1], // second point y
        dx = px - sx, // direction between the two points
        dy = py - sy, // direction between the two points
        lx, ly,
        ldx, ldy,
        sq, i;

    // normalize the direction
    sq = Math.sqrt(dx*dx + dy*dy);
    dx /= sq;
    dy /= sq;

    // start the new path
    compressed.push([sx,sy]);

    for(i = 2; i < path.length; i++) {

        // store the last point
        lx = px;
        ly = py;

        // store the last direction
        ldx = dx;
        ldy = dy;

        // next point
        px = path[i][0];
        py = path[i][1];

        // next direction
        dx = px - lx;
        dy = py - ly;

        // normalize
        sq = Math.sqrt(dx*dx + dy*dy);
        dx /= sq;
        dy /= sq;

        // if the direction has changed, store the point
        if ( dx !== ldx || dy !== ldy ) {
            compressed.push([lx,ly]);
        }
    }

    // store the last point
    compressed.push([px,py]);

    return compressed;
}
exports.compressPath = compressPath;

},{}],35:[function(require,module,exports){
var Heap       = require('heap');
var Util       = require('../core/Util');
var Heuristic  = require('../core/Heuristic');
var DiagonalMovement = require('../core/DiagonalMovement');

/**
 * A* path-finder. Based upon https://github.com/bgrins/javascript-astar
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching 
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 * @param {number} opt.weight Weight to apply to the heuristic to allow for
 *     suboptimal paths, in order to speed up the search.
 */
function AStarFinder(opt) {
    opt = opt || {};
    this.allowDiagonal = opt.allowDiagonal;
    this.dontCrossCorners = opt.dontCrossCorners;
    this.heuristic = opt.heuristic || Heuristic.manhattan;
    this.weight = opt.weight || 1;
    this.diagonalMovement = opt.diagonalMovement;

    if (!this.diagonalMovement) {
        if (!this.allowDiagonal) {
            this.diagonalMovement = DiagonalMovement.Never;
        } else {
            if (this.dontCrossCorners) {
                this.diagonalMovement = DiagonalMovement.OnlyWhenNoObstacles;
            } else {
                this.diagonalMovement = DiagonalMovement.IfAtMostOneObstacle;
            }
        }
    }

    // When diagonal movement is allowed the manhattan heuristic is not
    //admissible. It should be octile instead
    if (this.diagonalMovement === DiagonalMovement.Never) {
        this.heuristic = opt.heuristic || Heuristic.manhattan;
    } else {
        this.heuristic = opt.heuristic || Heuristic.octile;
    }
}

/**
 * Find and return the the path.
 * @return {Array<Array<number>>} The path, including both start and
 *     end positions.
 */
AStarFinder.prototype.findPath = function(startX, startY, endX, endY, grid) {
    var openList = new Heap(function(nodeA, nodeB) {
            return nodeA.f - nodeB.f;
        }),
        startNode = grid.getNodeAt(startX, startY),
        endNode = grid.getNodeAt(endX, endY),
        heuristic = this.heuristic,
        diagonalMovement = this.diagonalMovement,
        weight = this.weight,
        abs = Math.abs, SQRT2 = Math.SQRT2,
        node, neighbors, neighbor, i, l, x, y, ng;

    // set the `g` and `f` value of the start node to be 0
    startNode.g = 0;
    startNode.f = 0;

    // push the start node into the open list
    openList.push(startNode);
    startNode.opened = true;

    // while the open list is not empty
    while (!openList.empty()) {
        // pop the position of node which has the minimum `f` value.
        node = openList.pop();
        node.closed = true;

        // if reached the end position, construct the path and return it
        if (node === endNode) {
            return Util.backtrace(endNode);
        }

        // get neigbours of the current node
        neighbors = grid.getNeighbors(node, diagonalMovement);
        for (i = 0, l = neighbors.length; i < l; ++i) {
            neighbor = neighbors[i];

            if (neighbor.closed) {
                continue;
            }

            x = neighbor.x;
            y = neighbor.y;

            // get the distance between current node and the neighbor
            // and calculate the next g score
            ng = node.g + ((x - node.x === 0 || y - node.y === 0) ? 1 : SQRT2);

            // check if the neighbor has not been inspected yet, or
            // can be reached with smaller cost from the current node
            if (!neighbor.opened || ng < neighbor.g) {
                neighbor.g = ng;
                neighbor.h = neighbor.h || weight * heuristic(abs(x - endX), abs(y - endY));
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = node;

                if (!neighbor.opened) {
                    openList.push(neighbor);
                    neighbor.opened = true;
                } else {
                    // the neighbor can be reached with smaller cost.
                    // Since its f value has been updated, we have to
                    // update its position in the open list
                    openList.updateItem(neighbor);
                }
            }
        } // end for each neighbor
    } // end while not open list empty

    // fail to find the path
    return [];
};

module.exports = AStarFinder;

},{"../core/DiagonalMovement":30,"../core/Heuristic":32,"../core/Util":34,"heap":27}],36:[function(require,module,exports){
var AStarFinder = require('./AStarFinder');

/**
 * Best-First-Search path-finder.
 * @constructor
 * @extends AStarFinder
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 */
function BestFirstFinder(opt) {
    AStarFinder.call(this, opt);

    var orig = this.heuristic;
    this.heuristic = function(dx, dy) {
        return orig(dx, dy) * 1000000;
    };
}

BestFirstFinder.prototype = new AStarFinder();
BestFirstFinder.prototype.constructor = BestFirstFinder;

module.exports = BestFirstFinder;

},{"./AStarFinder":35}],37:[function(require,module,exports){
var Heap       = require('heap');
var Util       = require('../core/Util');
var Heuristic  = require('../core/Heuristic');
var DiagonalMovement = require('../core/DiagonalMovement');

/**
 * A* path-finder.
 * based upon https://github.com/bgrins/javascript-astar
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 * @param {number} opt.weight Weight to apply to the heuristic to allow for
 *     suboptimal paths, in order to speed up the search.
 */
function BiAStarFinder(opt) {
    opt = opt || {};
    this.allowDiagonal = opt.allowDiagonal;
    this.dontCrossCorners = opt.dontCrossCorners;
    this.diagonalMovement = opt.diagonalMovement;
    this.heuristic = opt.heuristic || Heuristic.manhattan;
    this.weight = opt.weight || 1;

    if (!this.diagonalMovement) {
        if (!this.allowDiagonal) {
            this.diagonalMovement = DiagonalMovement.Never;
        } else {
            if (this.dontCrossCorners) {
                this.diagonalMovement = DiagonalMovement.OnlyWhenNoObstacles;
            } else {
                this.diagonalMovement = DiagonalMovement.IfAtMostOneObstacle;
            }
        }
    }

    //When diagonal movement is allowed the manhattan heuristic is not admissible
    //It should be octile instead
    if (this.diagonalMovement === DiagonalMovement.Never) {
        this.heuristic = opt.heuristic || Heuristic.manhattan;
    } else {
        this.heuristic = opt.heuristic || Heuristic.octile;
    }
}

/**
 * Find and return the the path.
 * @return {Array<Array<number>>} The path, including both start and
 *     end positions.
 */
BiAStarFinder.prototype.findPath = function(startX, startY, endX, endY, grid) {
    var cmp = function(nodeA, nodeB) {
            return nodeA.f - nodeB.f;
        },
        startOpenList = new Heap(cmp),
        endOpenList = new Heap(cmp),
        startNode = grid.getNodeAt(startX, startY),
        endNode = grid.getNodeAt(endX, endY),
        heuristic = this.heuristic,
        diagonalMovement = this.diagonalMovement,
        weight = this.weight,
        abs = Math.abs, SQRT2 = Math.SQRT2,
        node, neighbors, neighbor, i, l, x, y, ng,
        BY_START = 1, BY_END = 2;

    // set the `g` and `f` value of the start node to be 0
    // and push it into the start open list
    startNode.g = 0;
    startNode.f = 0;
    startOpenList.push(startNode);
    startNode.opened = BY_START;

    // set the `g` and `f` value of the end node to be 0
    // and push it into the open open list
    endNode.g = 0;
    endNode.f = 0;
    endOpenList.push(endNode);
    endNode.opened = BY_END;

    // while both the open lists are not empty
    while (!startOpenList.empty() && !endOpenList.empty()) {

        // pop the position of start node which has the minimum `f` value.
        node = startOpenList.pop();
        node.closed = true;

        // get neigbours of the current node
        neighbors = grid.getNeighbors(node, diagonalMovement);
        for (i = 0, l = neighbors.length; i < l; ++i) {
            neighbor = neighbors[i];

            if (neighbor.closed) {
                continue;
            }
            if (neighbor.opened === BY_END) {
                return Util.biBacktrace(node, neighbor);
            }

            x = neighbor.x;
            y = neighbor.y;

            // get the distance between current node and the neighbor
            // and calculate the next g score
            ng = node.g + ((x - node.x === 0 || y - node.y === 0) ? 1 : SQRT2);

            // check if the neighbor has not been inspected yet, or
            // can be reached with smaller cost from the current node
            if (!neighbor.opened || ng < neighbor.g) {
                neighbor.g = ng;
                neighbor.h = neighbor.h ||
                    weight * heuristic(abs(x - endX), abs(y - endY));
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = node;

                if (!neighbor.opened) {
                    startOpenList.push(neighbor);
                    neighbor.opened = BY_START;
                } else {
                    // the neighbor can be reached with smaller cost.
                    // Since its f value has been updated, we have to
                    // update its position in the open list
                    startOpenList.updateItem(neighbor);
                }
            }
        } // end for each neighbor


        // pop the position of end node which has the minimum `f` value.
        node = endOpenList.pop();
        node.closed = true;

        // get neigbours of the current node
        neighbors = grid.getNeighbors(node, diagonalMovement);
        for (i = 0, l = neighbors.length; i < l; ++i) {
            neighbor = neighbors[i];

            if (neighbor.closed) {
                continue;
            }
            if (neighbor.opened === BY_START) {
                return Util.biBacktrace(neighbor, node);
            }

            x = neighbor.x;
            y = neighbor.y;

            // get the distance between current node and the neighbor
            // and calculate the next g score
            ng = node.g + ((x - node.x === 0 || y - node.y === 0) ? 1 : SQRT2);

            // check if the neighbor has not been inspected yet, or
            // can be reached with smaller cost from the current node
            if (!neighbor.opened || ng < neighbor.g) {
                neighbor.g = ng;
                neighbor.h = neighbor.h ||
                    weight * heuristic(abs(x - startX), abs(y - startY));
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = node;

                if (!neighbor.opened) {
                    endOpenList.push(neighbor);
                    neighbor.opened = BY_END;
                } else {
                    // the neighbor can be reached with smaller cost.
                    // Since its f value has been updated, we have to
                    // update its position in the open list
                    endOpenList.updateItem(neighbor);
                }
            }
        } // end for each neighbor
    } // end while not open list empty

    // fail to find the path
    return [];
};

module.exports = BiAStarFinder;

},{"../core/DiagonalMovement":30,"../core/Heuristic":32,"../core/Util":34,"heap":27}],38:[function(require,module,exports){
var BiAStarFinder = require('./BiAStarFinder');

/**
 * Bi-direcitional Best-First-Search path-finder.
 * @constructor
 * @extends BiAStarFinder
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 */
function BiBestFirstFinder(opt) {
    BiAStarFinder.call(this, opt);

    var orig = this.heuristic;
    this.heuristic = function(dx, dy) {
        return orig(dx, dy) * 1000000;
    };
}

BiBestFirstFinder.prototype = new BiAStarFinder();
BiBestFirstFinder.prototype.constructor = BiBestFirstFinder;

module.exports = BiBestFirstFinder;

},{"./BiAStarFinder":37}],39:[function(require,module,exports){
var Util = require('../core/Util');
var DiagonalMovement = require('../core/DiagonalMovement');

/**
 * Bi-directional Breadth-First-Search path finder.
 * @constructor
 * @param {object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 */
function BiBreadthFirstFinder(opt) {
    opt = opt || {};
    this.allowDiagonal = opt.allowDiagonal;
    this.dontCrossCorners = opt.dontCrossCorners;
    this.diagonalMovement = opt.diagonalMovement;

    if (!this.diagonalMovement) {
        if (!this.allowDiagonal) {
            this.diagonalMovement = DiagonalMovement.Never;
        } else {
            if (this.dontCrossCorners) {
                this.diagonalMovement = DiagonalMovement.OnlyWhenNoObstacles;
            } else {
                this.diagonalMovement = DiagonalMovement.IfAtMostOneObstacle;
            }
        }
    }
}


/**
 * Find and return the the path.
 * @return {Array<Array<number>>} The path, including both start and
 *     end positions.
 */
BiBreadthFirstFinder.prototype.findPath = function(startX, startY, endX, endY, grid) {
    var startNode = grid.getNodeAt(startX, startY),
        endNode = grid.getNodeAt(endX, endY),
        startOpenList = [], endOpenList = [],
        neighbors, neighbor, node,
        diagonalMovement = this.diagonalMovement,
        BY_START = 0, BY_END = 1,
        i, l;

    // push the start and end nodes into the queues
    startOpenList.push(startNode);
    startNode.opened = true;
    startNode.by = BY_START;

    endOpenList.push(endNode);
    endNode.opened = true;
    endNode.by = BY_END;

    // while both the queues are not empty
    while (startOpenList.length && endOpenList.length) {

        // expand start open list

        node = startOpenList.shift();
        node.closed = true;

        neighbors = grid.getNeighbors(node, diagonalMovement);
        for (i = 0, l = neighbors.length; i < l; ++i) {
            neighbor = neighbors[i];

            if (neighbor.closed) {
                continue;
            }
            if (neighbor.opened) {
                // if this node has been inspected by the reversed search,
                // then a path is found.
                if (neighbor.by === BY_END) {
                    return Util.biBacktrace(node, neighbor);
                }
                continue;
            }
            startOpenList.push(neighbor);
            neighbor.parent = node;
            neighbor.opened = true;
            neighbor.by = BY_START;
        }

        // expand end open list

        node = endOpenList.shift();
        node.closed = true;

        neighbors = grid.getNeighbors(node, diagonalMovement);
        for (i = 0, l = neighbors.length; i < l; ++i) {
            neighbor = neighbors[i];

            if (neighbor.closed) {
                continue;
            }
            if (neighbor.opened) {
                if (neighbor.by === BY_START) {
                    return Util.biBacktrace(neighbor, node);
                }
                continue;
            }
            endOpenList.push(neighbor);
            neighbor.parent = node;
            neighbor.opened = true;
            neighbor.by = BY_END;
        }
    }

    // fail to find the path
    return [];
};

module.exports = BiBreadthFirstFinder;

},{"../core/DiagonalMovement":30,"../core/Util":34}],40:[function(require,module,exports){
var BiAStarFinder = require('./BiAStarFinder');

/**
 * Bi-directional Dijkstra path-finder.
 * @constructor
 * @extends BiAStarFinder
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 */
function BiDijkstraFinder(opt) {
    BiAStarFinder.call(this, opt);
    this.heuristic = function(dx, dy) {
        return 0;
    };
}

BiDijkstraFinder.prototype = new BiAStarFinder();
BiDijkstraFinder.prototype.constructor = BiDijkstraFinder;

module.exports = BiDijkstraFinder;

},{"./BiAStarFinder":37}],41:[function(require,module,exports){
var Util = require('../core/Util');
var DiagonalMovement = require('../core/DiagonalMovement');

/**
 * Breadth-First-Search path finder.
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 */
function BreadthFirstFinder(opt) {
    opt = opt || {};
    this.allowDiagonal = opt.allowDiagonal;
    this.dontCrossCorners = opt.dontCrossCorners;
    this.diagonalMovement = opt.diagonalMovement;

    if (!this.diagonalMovement) {
        if (!this.allowDiagonal) {
            this.diagonalMovement = DiagonalMovement.Never;
        } else {
            if (this.dontCrossCorners) {
                this.diagonalMovement = DiagonalMovement.OnlyWhenNoObstacles;
            } else {
                this.diagonalMovement = DiagonalMovement.IfAtMostOneObstacle;
            }
        }
    }
}

/**
 * Find and return the the path.
 * @return {Array<Array<number>>} The path, including both start and
 *     end positions.
 */
BreadthFirstFinder.prototype.findPath = function(startX, startY, endX, endY, grid) {
    var openList = [],
        diagonalMovement = this.diagonalMovement,
        startNode = grid.getNodeAt(startX, startY),
        endNode = grid.getNodeAt(endX, endY),
        neighbors, neighbor, node, i, l;

    // push the start pos into the queue
    openList.push(startNode);
    startNode.opened = true;

    // while the queue is not empty
    while (openList.length) {
        // take the front node from the queue
        node = openList.shift();
        node.closed = true;

        // reached the end position
        if (node === endNode) {
            return Util.backtrace(endNode);
        }

        neighbors = grid.getNeighbors(node, diagonalMovement);
        for (i = 0, l = neighbors.length; i < l; ++i) {
            neighbor = neighbors[i];

            // skip this neighbor if it has been inspected before
            if (neighbor.closed || neighbor.opened) {
                continue;
            }

            openList.push(neighbor);
            neighbor.opened = true;
            neighbor.parent = node;
        }
    }
    
    // fail to find the path
    return [];
};

module.exports = BreadthFirstFinder;

},{"../core/DiagonalMovement":30,"../core/Util":34}],42:[function(require,module,exports){
var AStarFinder = require('./AStarFinder');

/**
 * Dijkstra path-finder.
 * @constructor
 * @extends AStarFinder
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 */
function DijkstraFinder(opt) {
    AStarFinder.call(this, opt);
    this.heuristic = function(dx, dy) {
        return 0;
    };
}

DijkstraFinder.prototype = new AStarFinder();
DijkstraFinder.prototype.constructor = DijkstraFinder;

module.exports = DijkstraFinder;

},{"./AStarFinder":35}],43:[function(require,module,exports){
var Util       = require('../core/Util');
var Heuristic  = require('../core/Heuristic');
var Node       = require('../core/Node');
var DiagonalMovement = require('../core/DiagonalMovement');

/**
 * Iterative Deeping A Star (IDA*) path-finder.
 *
 * Recursion based on:
 *   http://www.apl.jhu.edu/~hall/AI-Programming/IDA-Star.html
 *
 * Path retracing based on:
 *  V. Nageshwara Rao, Vipin Kumar and K. Ramesh
 *  "A Parallel Implementation of Iterative-Deeping-A*", January 1987.
 *  ftp://ftp.cs.utexas.edu/.snapshot/hourly.1/pub/AI-Lab/tech-reports/UT-AI-TR-87-46.pdf
 *
 * @author Gerard Meier (www.gerardmeier.com)
 *
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 * @param {number} opt.weight Weight to apply to the heuristic to allow for
 *     suboptimal paths, in order to speed up the search.
 * @param {boolean} opt.trackRecursion Whether to track recursion for
 *     statistical purposes.
 * @param {number} opt.timeLimit Maximum execution time. Use <= 0 for infinite.
 */
function IDAStarFinder(opt) {
    opt = opt || {};
    this.allowDiagonal = opt.allowDiagonal;
    this.dontCrossCorners = opt.dontCrossCorners;
    this.diagonalMovement = opt.diagonalMovement;
    this.heuristic = opt.heuristic || Heuristic.manhattan;
    this.weight = opt.weight || 1;
    this.trackRecursion = opt.trackRecursion || false;
    this.timeLimit = opt.timeLimit || Infinity; // Default: no time limit.

    if (!this.diagonalMovement) {
        if (!this.allowDiagonal) {
            this.diagonalMovement = DiagonalMovement.Never;
        } else {
            if (this.dontCrossCorners) {
                this.diagonalMovement = DiagonalMovement.OnlyWhenNoObstacles;
            } else {
                this.diagonalMovement = DiagonalMovement.IfAtMostOneObstacle;
            }
        }
    }

    // When diagonal movement is allowed the manhattan heuristic is not
    // admissible, it should be octile instead
    if (this.diagonalMovement === DiagonalMovement.Never) {
        this.heuristic = opt.heuristic || Heuristic.manhattan;
    } else {
        this.heuristic = opt.heuristic || Heuristic.octile;
    }
}

/**
 * Find and return the the path. When an empty array is returned, either
 * no path is possible, or the maximum execution time is reached.
 *
 * @return {Array<Array<number>>} The path, including both start and
 *     end positions.
 */
IDAStarFinder.prototype.findPath = function(startX, startY, endX, endY, grid) {
    // Used for statistics:
    var nodesVisited = 0;

    // Execution time limitation:
    var startTime = new Date().getTime();

    // Heuristic helper:
    var h = function(a, b) {
        return this.heuristic(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    }.bind(this);

    // Step cost from a to b:
    var cost = function(a, b) {
        return (a.x === b.x || a.y === b.y) ? 1 : Math.SQRT2;
    };

    /**
     * IDA* search implementation.
     *
     * @param {Node} The node currently expanding from.
     * @param {number} Cost to reach the given node.
     * @param {number} Maximum search depth (cut-off value).
     * @param {Array<Array<number>>} The found route.
     * @param {number} Recursion depth.
     *
     * @return {Object} either a number with the new optimal cut-off depth,
     * or a valid node instance, in which case a path was found.
     */
    var search = function(node, g, cutoff, route, depth) {
        nodesVisited++;

        // Enforce timelimit:
        if (this.timeLimit > 0 &&
            new Date().getTime() - startTime > this.timeLimit * 1000) {
            // Enforced as "path-not-found".
            return Infinity;
        }

        var f = g + h(node, end) * this.weight;

        // We've searched too deep for this iteration.
        if (f > cutoff) {
            return f;
        }

        if (node == end) {
            route[depth] = [node.x, node.y];
            return node;
        }

        var min, t, k, neighbour;

        var neighbours = grid.getNeighbors(node, this.diagonalMovement);

        // Sort the neighbours, gives nicer paths. But, this deviates
        // from the original algorithm - so I left it out.
        //neighbours.sort(function(a, b){
        //    return h(a, end) - h(b, end);
        //});

        
        /*jshint -W084 *///Disable warning: Expected a conditional expression and instead saw an assignment
        for (k = 0, min = Infinity; neighbour = neighbours[k]; ++k) {
        /*jshint +W084 *///Enable warning: Expected a conditional expression and instead saw an assignment
            if (this.trackRecursion) {
                // Retain a copy for visualisation. Due to recursion, this
                // node may be part of other paths too.
                neighbour.retainCount = neighbour.retainCount + 1 || 1;

                if(neighbour.tested !== true) {
                    neighbour.tested = true;
                }
            }

            t = search(neighbour, g + cost(node, neighbour), cutoff, route, depth + 1);

            if (t instanceof Node) {
                route[depth] = [node.x, node.y];

                // For a typical A* linked list, this would work:
                // neighbour.parent = node;
                return t;
            }

            // Decrement count, then determine whether it's actually closed.
            if (this.trackRecursion && (--neighbour.retainCount) === 0) {
                neighbour.tested = false;
            }

            if (t < min) {
                min = t;
            }
        }

        return min;

    }.bind(this);

    // Node instance lookups:
    var start = grid.getNodeAt(startX, startY);
    var end   = grid.getNodeAt(endX, endY);

    // Initial search depth, given the typical heuristic contraints,
    // there should be no cheaper route possible.
    var cutOff = h(start, end);

    var j, route, t;

    // With an overflow protection.
    for (j = 0; true; ++j) {

        route = [];

        // Search till cut-off depth:
        t = search(start, 0, cutOff, route, 0);

        // Route not possible, or not found in time limit.
        if (t === Infinity) {
            return [];
        }

        // If t is a node, it's also the end node. Route is now
        // populated with a valid path to the end node.
        if (t instanceof Node) {
            return route;
        }

        // Try again, this time with a deeper cut-off. The t score
        // is the closest we got to the end node.
        cutOff = t;
    }

    // This _should_ never to be reached.
    return [];
};

module.exports = IDAStarFinder;

},{"../core/DiagonalMovement":30,"../core/Heuristic":32,"../core/Node":33,"../core/Util":34}],44:[function(require,module,exports){
/**
 * @author imor / https://github.com/imor
 */
var JumpPointFinderBase = require('./JumpPointFinderBase');
var DiagonalMovement = require('../core/DiagonalMovement');

/**
 * Path finder using the Jump Point Search algorithm which always moves
 * diagonally irrespective of the number of obstacles.
 */
function JPFAlwaysMoveDiagonally(opt) {
    JumpPointFinderBase.call(this, opt);
}

JPFAlwaysMoveDiagonally.prototype = new JumpPointFinderBase();
JPFAlwaysMoveDiagonally.prototype.constructor = JPFAlwaysMoveDiagonally;

/**
 * Search recursively in the direction (parent -> child), stopping only when a
 * jump point is found.
 * @protected
 * @return {Array<Array<number>>} The x, y coordinate of the jump point
 *     found, or null if not found
 */
JPFAlwaysMoveDiagonally.prototype._jump = function(x, y, px, py) {
    var grid = this.grid,
        dx = x - px, dy = y - py;

    if (!grid.isWalkableAt(x, y)) {
        return null;
    }

    if(this.trackJumpRecursion === true) {
        grid.getNodeAt(x, y).tested = true;
    }

    if (grid.getNodeAt(x, y) === this.endNode) {
        return [x, y];
    }

    // check for forced neighbors
    // along the diagonal
    if (dx !== 0 && dy !== 0) {
        if ((grid.isWalkableAt(x - dx, y + dy) && !grid.isWalkableAt(x - dx, y)) ||
            (grid.isWalkableAt(x + dx, y - dy) && !grid.isWalkableAt(x, y - dy))) {
            return [x, y];
        }
        // when moving diagonally, must check for vertical/horizontal jump points
        if (this._jump(x + dx, y, x, y) || this._jump(x, y + dy, x, y)) {
            return [x, y];
        }
    }
    // horizontally/vertically
    else {
        if( dx !== 0 ) { // moving along x
            if((grid.isWalkableAt(x + dx, y + 1) && !grid.isWalkableAt(x, y + 1)) ||
               (grid.isWalkableAt(x + dx, y - 1) && !grid.isWalkableAt(x, y - 1))) {
                return [x, y];
            }
        }
        else {
            if((grid.isWalkableAt(x + 1, y + dy) && !grid.isWalkableAt(x + 1, y)) ||
               (grid.isWalkableAt(x - 1, y + dy) && !grid.isWalkableAt(x - 1, y))) {
                return [x, y];
            }
        }
    }

    return this._jump(x + dx, y + dy, x, y);
};

/**
 * Find the neighbors for the given node. If the node has a parent,
 * prune the neighbors based on the jump point search algorithm, otherwise
 * return all available neighbors.
 * @return {Array<Array<number>>} The neighbors found.
 */
JPFAlwaysMoveDiagonally.prototype._findNeighbors = function(node) {
    var parent = node.parent,
        x = node.x, y = node.y,
        grid = this.grid,
        px, py, nx, ny, dx, dy,
        neighbors = [], neighborNodes, neighborNode, i, l;

    // directed pruning: can ignore most neighbors, unless forced.
    if (parent) {
        px = parent.x;
        py = parent.y;
        // get the normalized direction of travel
        dx = (x - px) / Math.max(Math.abs(x - px), 1);
        dy = (y - py) / Math.max(Math.abs(y - py), 1);

        // search diagonally
        if (dx !== 0 && dy !== 0) {
            if (grid.isWalkableAt(x, y + dy)) {
                neighbors.push([x, y + dy]);
            }
            if (grid.isWalkableAt(x + dx, y)) {
                neighbors.push([x + dx, y]);
            }
            if (grid.isWalkableAt(x + dx, y + dy)) {
                neighbors.push([x + dx, y + dy]);
            }
            if (!grid.isWalkableAt(x - dx, y)) {
                neighbors.push([x - dx, y + dy]);
            }
            if (!grid.isWalkableAt(x, y - dy)) {
                neighbors.push([x + dx, y - dy]);
            }
        }
        // search horizontally/vertically
        else {
            if(dx === 0) {
                if (grid.isWalkableAt(x, y + dy)) {
                    neighbors.push([x, y + dy]);
                }
                if (!grid.isWalkableAt(x + 1, y)) {
                    neighbors.push([x + 1, y + dy]);
                }
                if (!grid.isWalkableAt(x - 1, y)) {
                    neighbors.push([x - 1, y + dy]);
                }
            }
            else {
                if (grid.isWalkableAt(x + dx, y)) {
                    neighbors.push([x + dx, y]);
                }
                if (!grid.isWalkableAt(x, y + 1)) {
                    neighbors.push([x + dx, y + 1]);
                }
                if (!grid.isWalkableAt(x, y - 1)) {
                    neighbors.push([x + dx, y - 1]);
                }
            }
        }
    }
    // return all neighbors
    else {
        neighborNodes = grid.getNeighbors(node, DiagonalMovement.Always);
        for (i = 0, l = neighborNodes.length; i < l; ++i) {
            neighborNode = neighborNodes[i];
            neighbors.push([neighborNode.x, neighborNode.y]);
        }
    }

    return neighbors;
};

module.exports = JPFAlwaysMoveDiagonally;

},{"../core/DiagonalMovement":30,"./JumpPointFinderBase":49}],45:[function(require,module,exports){
/**
 * @author imor / https://github.com/imor
 */
var JumpPointFinderBase = require('./JumpPointFinderBase');
var DiagonalMovement = require('../core/DiagonalMovement');

/**
 * Path finder using the Jump Point Search algorithm which moves
 * diagonally only when there is at most one obstacle.
 */
function JPFMoveDiagonallyIfAtMostOneObstacle(opt) {
    JumpPointFinderBase.call(this, opt);
}

JPFMoveDiagonallyIfAtMostOneObstacle.prototype = new JumpPointFinderBase();
JPFMoveDiagonallyIfAtMostOneObstacle.prototype.constructor = JPFMoveDiagonallyIfAtMostOneObstacle;

/**
 * Search recursively in the direction (parent -> child), stopping only when a
 * jump point is found.
 * @protected
 * @return {Array<Array<number>>} The x, y coordinate of the jump point
 *     found, or null if not found
 */
JPFMoveDiagonallyIfAtMostOneObstacle.prototype._jump = function(x, y, px, py) {
    var grid = this.grid,
        dx = x - px, dy = y - py;

    if (!grid.isWalkableAt(x, y)) {
        return null;
    }

    if(this.trackJumpRecursion === true) {
        grid.getNodeAt(x, y).tested = true;
    }

    if (grid.getNodeAt(x, y) === this.endNode) {
        return [x, y];
    }

    // check for forced neighbors
    // along the diagonal
    if (dx !== 0 && dy !== 0) {
        if ((grid.isWalkableAt(x - dx, y + dy) && !grid.isWalkableAt(x - dx, y)) ||
            (grid.isWalkableAt(x + dx, y - dy) && !grid.isWalkableAt(x, y - dy))) {
            return [x, y];
        }
        // when moving diagonally, must check for vertical/horizontal jump points
        if (this._jump(x + dx, y, x, y) || this._jump(x, y + dy, x, y)) {
            return [x, y];
        }
    }
    // horizontally/vertically
    else {
        if( dx !== 0 ) { // moving along x
            if((grid.isWalkableAt(x + dx, y + 1) && !grid.isWalkableAt(x, y + 1)) ||
               (grid.isWalkableAt(x + dx, y - 1) && !grid.isWalkableAt(x, y - 1))) {
                return [x, y];
            }
        }
        else {
            if((grid.isWalkableAt(x + 1, y + dy) && !grid.isWalkableAt(x + 1, y)) ||
               (grid.isWalkableAt(x - 1, y + dy) && !grid.isWalkableAt(x - 1, y))) {
                return [x, y];
            }
        }
    }

    // moving diagonally, must make sure one of the vertical/horizontal
    // neighbors is open to allow the path
    if (grid.isWalkableAt(x + dx, y) || grid.isWalkableAt(x, y + dy)) {
        return this._jump(x + dx, y + dy, x, y);
    } else {
        return null;
    }
};

/**
 * Find the neighbors for the given node. If the node has a parent,
 * prune the neighbors based on the jump point search algorithm, otherwise
 * return all available neighbors.
 * @return {Array<Array<number>>} The neighbors found.
 */
JPFMoveDiagonallyIfAtMostOneObstacle.prototype._findNeighbors = function(node) {
    var parent = node.parent,
        x = node.x, y = node.y,
        grid = this.grid,
        px, py, nx, ny, dx, dy,
        neighbors = [], neighborNodes, neighborNode, i, l;

    // directed pruning: can ignore most neighbors, unless forced.
    if (parent) {
        px = parent.x;
        py = parent.y;
        // get the normalized direction of travel
        dx = (x - px) / Math.max(Math.abs(x - px), 1);
        dy = (y - py) / Math.max(Math.abs(y - py), 1);

        // search diagonally
        if (dx !== 0 && dy !== 0) {
            if (grid.isWalkableAt(x, y + dy)) {
                neighbors.push([x, y + dy]);
            }
            if (grid.isWalkableAt(x + dx, y)) {
                neighbors.push([x + dx, y]);
            }
            if (grid.isWalkableAt(x, y + dy) || grid.isWalkableAt(x + dx, y)) {
                neighbors.push([x + dx, y + dy]);
            }
            if (!grid.isWalkableAt(x - dx, y) && grid.isWalkableAt(x, y + dy)) {
                neighbors.push([x - dx, y + dy]);
            }
            if (!grid.isWalkableAt(x, y - dy) && grid.isWalkableAt(x + dx, y)) {
                neighbors.push([x + dx, y - dy]);
            }
        }
        // search horizontally/vertically
        else {
            if(dx === 0) {
                if (grid.isWalkableAt(x, y + dy)) {
                    neighbors.push([x, y + dy]);
                    if (!grid.isWalkableAt(x + 1, y)) {
                        neighbors.push([x + 1, y + dy]);
                    }
                    if (!grid.isWalkableAt(x - 1, y)) {
                        neighbors.push([x - 1, y + dy]);
                    }
                }
            }
            else {
                if (grid.isWalkableAt(x + dx, y)) {
                    neighbors.push([x + dx, y]);
                    if (!grid.isWalkableAt(x, y + 1)) {
                        neighbors.push([x + dx, y + 1]);
                    }
                    if (!grid.isWalkableAt(x, y - 1)) {
                        neighbors.push([x + dx, y - 1]);
                    }
                }
            }
        }
    }
    // return all neighbors
    else {
        neighborNodes = grid.getNeighbors(node, DiagonalMovement.IfAtMostOneObstacle);
        for (i = 0, l = neighborNodes.length; i < l; ++i) {
            neighborNode = neighborNodes[i];
            neighbors.push([neighborNode.x, neighborNode.y]);
        }
    }

    return neighbors;
};

module.exports = JPFMoveDiagonallyIfAtMostOneObstacle;

},{"../core/DiagonalMovement":30,"./JumpPointFinderBase":49}],46:[function(require,module,exports){
/**
 * @author imor / https://github.com/imor
 */
var JumpPointFinderBase = require('./JumpPointFinderBase');
var DiagonalMovement = require('../core/DiagonalMovement');

/**
 * Path finder using the Jump Point Search algorithm which moves
 * diagonally only when there are no obstacles.
 */
function JPFMoveDiagonallyIfNoObstacles(opt) {
    JumpPointFinderBase.call(this, opt);
}

JPFMoveDiagonallyIfNoObstacles.prototype = new JumpPointFinderBase();
JPFMoveDiagonallyIfNoObstacles.prototype.constructor = JPFMoveDiagonallyIfNoObstacles;

/**
 * Search recursively in the direction (parent -> child), stopping only when a
 * jump point is found.
 * @protected
 * @return {Array<Array<number>>} The x, y coordinate of the jump point
 *     found, or null if not found
 */
JPFMoveDiagonallyIfNoObstacles.prototype._jump = function(x, y, px, py) {
    var grid = this.grid,
        dx = x - px, dy = y - py;

    if (!grid.isWalkableAt(x, y)) {
        return null;
    }

    if(this.trackJumpRecursion === true) {
        grid.getNodeAt(x, y).tested = true;
    }

    if (grid.getNodeAt(x, y) === this.endNode) {
        return [x, y];
    }

    // check for forced neighbors
    // along the diagonal
    if (dx !== 0 && dy !== 0) {
        // if ((grid.isWalkableAt(x - dx, y + dy) && !grid.isWalkableAt(x - dx, y)) ||
            // (grid.isWalkableAt(x + dx, y - dy) && !grid.isWalkableAt(x, y - dy))) {
            // return [x, y];
        // }
        // when moving diagonally, must check for vertical/horizontal jump points
        if (this._jump(x + dx, y, x, y) || this._jump(x, y + dy, x, y)) {
            return [x, y];
        }
    }
    // horizontally/vertically
    else {
        if (dx !== 0) {
            if ((grid.isWalkableAt(x, y - 1) && !grid.isWalkableAt(x - dx, y - 1)) ||
                (grid.isWalkableAt(x, y + 1) && !grid.isWalkableAt(x - dx, y + 1))) {
                return [x, y];
            }
        }
        else if (dy !== 0) {
            if ((grid.isWalkableAt(x - 1, y) && !grid.isWalkableAt(x - 1, y - dy)) ||
                (grid.isWalkableAt(x + 1, y) && !grid.isWalkableAt(x + 1, y - dy))) {
                return [x, y];
            }
            // When moving vertically, must check for horizontal jump points
            // if (this._jump(x + 1, y, x, y) || this._jump(x - 1, y, x, y)) {
                // return [x, y];
            // }
        }
    }

    // moving diagonally, must make sure one of the vertical/horizontal
    // neighbors is open to allow the path
    if (grid.isWalkableAt(x + dx, y) && grid.isWalkableAt(x, y + dy)) {
        return this._jump(x + dx, y + dy, x, y);
    } else {
        return null;
    }
};

/**
 * Find the neighbors for the given node. If the node has a parent,
 * prune the neighbors based on the jump point search algorithm, otherwise
 * return all available neighbors.
 * @return {Array<Array<number>>} The neighbors found.
 */
JPFMoveDiagonallyIfNoObstacles.prototype._findNeighbors = function(node) {
    var parent = node.parent,
        x = node.x, y = node.y,
        grid = this.grid,
        px, py, nx, ny, dx, dy,
        neighbors = [], neighborNodes, neighborNode, i, l;

    // directed pruning: can ignore most neighbors, unless forced.
    if (parent) {
        px = parent.x;
        py = parent.y;
        // get the normalized direction of travel
        dx = (x - px) / Math.max(Math.abs(x - px), 1);
        dy = (y - py) / Math.max(Math.abs(y - py), 1);

        // search diagonally
        if (dx !== 0 && dy !== 0) {
            if (grid.isWalkableAt(x, y + dy)) {
                neighbors.push([x, y + dy]);
            }
            if (grid.isWalkableAt(x + dx, y)) {
                neighbors.push([x + dx, y]);
            }
            if (grid.isWalkableAt(x, y + dy) && grid.isWalkableAt(x + dx, y)) {
                neighbors.push([x + dx, y + dy]);
            }
        }
        // search horizontally/vertically
        else {
            var isNextWalkable;
            if (dx !== 0) {
                isNextWalkable = grid.isWalkableAt(x + dx, y);
                var isTopWalkable = grid.isWalkableAt(x, y + 1);
                var isBottomWalkable = grid.isWalkableAt(x, y - 1);

                if (isNextWalkable) {
                    neighbors.push([x + dx, y]);
                    if (isTopWalkable) {
                        neighbors.push([x + dx, y + 1]);
                    }
                    if (isBottomWalkable) {
                        neighbors.push([x + dx, y - 1]);
                    }
                }
                if (isTopWalkable) {
                    neighbors.push([x, y + 1]);
                }
                if (isBottomWalkable) {
                    neighbors.push([x, y - 1]);
                }
            }
            else if (dy !== 0) {
                isNextWalkable = grid.isWalkableAt(x, y + dy);
                var isRightWalkable = grid.isWalkableAt(x + 1, y);
                var isLeftWalkable = grid.isWalkableAt(x - 1, y);

                if (isNextWalkable) {
                    neighbors.push([x, y + dy]);
                    if (isRightWalkable) {
                        neighbors.push([x + 1, y + dy]);
                    }
                    if (isLeftWalkable) {
                        neighbors.push([x - 1, y + dy]);
                    }
                }
                if (isRightWalkable) {
                    neighbors.push([x + 1, y]);
                }
                if (isLeftWalkable) {
                    neighbors.push([x - 1, y]);
                }
            }
        }
    }
    // return all neighbors
    else {
        neighborNodes = grid.getNeighbors(node, DiagonalMovement.OnlyWhenNoObstacles);
        for (i = 0, l = neighborNodes.length; i < l; ++i) {
            neighborNode = neighborNodes[i];
            neighbors.push([neighborNode.x, neighborNode.y]);
        }
    }

    return neighbors;
};

module.exports = JPFMoveDiagonallyIfNoObstacles;

},{"../core/DiagonalMovement":30,"./JumpPointFinderBase":49}],47:[function(require,module,exports){
/**
 * @author imor / https://github.com/imor
 */
var JumpPointFinderBase = require('./JumpPointFinderBase');
var DiagonalMovement = require('../core/DiagonalMovement');

/**
 * Path finder using the Jump Point Search algorithm allowing only horizontal
 * or vertical movements.
 */
function JPFNeverMoveDiagonally(opt) {
    JumpPointFinderBase.call(this, opt);
}

JPFNeverMoveDiagonally.prototype = new JumpPointFinderBase();
JPFNeverMoveDiagonally.prototype.constructor = JPFNeverMoveDiagonally;

/**
 * Search recursively in the direction (parent -> child), stopping only when a
 * jump point is found.
 * @protected
 * @return {Array<Array<number>>} The x, y coordinate of the jump point
 *     found, or null if not found
 */
JPFNeverMoveDiagonally.prototype._jump = function(x, y, px, py) {
    var grid = this.grid,
        dx = x - px, dy = y - py;

    if (!grid.isWalkableAt(x, y)) {
        return null;
    }

    if(this.trackJumpRecursion === true) {
        grid.getNodeAt(x, y).tested = true;
    }

    if (grid.getNodeAt(x, y) === this.endNode) {
        return [x, y];
    }

    if (dx !== 0) {
        if ((grid.isWalkableAt(x, y - 1) && !grid.isWalkableAt(x - dx, y - 1)) ||
            (grid.isWalkableAt(x, y + 1) && !grid.isWalkableAt(x - dx, y + 1))) {
            return [x, y];
        }
    }
    else if (dy !== 0) {
        if ((grid.isWalkableAt(x - 1, y) && !grid.isWalkableAt(x - 1, y - dy)) ||
            (grid.isWalkableAt(x + 1, y) && !grid.isWalkableAt(x + 1, y - dy))) {
            return [x, y];
        }
        //When moving vertically, must check for horizontal jump points
        if (this._jump(x + 1, y, x, y) || this._jump(x - 1, y, x, y)) {
            return [x, y];
        }
    }
    else {
        throw new Error("Only horizontal and vertical movements are allowed");
    }

    return this._jump(x + dx, y + dy, x, y);
};

/**
 * Find the neighbors for the given node. If the node has a parent,
 * prune the neighbors based on the jump point search algorithm, otherwise
 * return all available neighbors.
 * @return {Array<Array<number>>} The neighbors found.
 */
JPFNeverMoveDiagonally.prototype._findNeighbors = function(node) {
    var parent = node.parent,
        x = node.x, y = node.y,
        grid = this.grid,
        px, py, nx, ny, dx, dy,
        neighbors = [], neighborNodes, neighborNode, i, l;

    // directed pruning: can ignore most neighbors, unless forced.
    if (parent) {
        px = parent.x;
        py = parent.y;
        // get the normalized direction of travel
        dx = (x - px) / Math.max(Math.abs(x - px), 1);
        dy = (y - py) / Math.max(Math.abs(y - py), 1);

        if (dx !== 0) {
            if (grid.isWalkableAt(x, y - 1)) {
                neighbors.push([x, y - 1]);
            }
            if (grid.isWalkableAt(x, y + 1)) {
                neighbors.push([x, y + 1]);
            }
            if (grid.isWalkableAt(x + dx, y)) {
                neighbors.push([x + dx, y]);
            }
        }
        else if (dy !== 0) {
            if (grid.isWalkableAt(x - 1, y)) {
                neighbors.push([x - 1, y]);
            }
            if (grid.isWalkableAt(x + 1, y)) {
                neighbors.push([x + 1, y]);
            }
            if (grid.isWalkableAt(x, y + dy)) {
                neighbors.push([x, y + dy]);
            }
        }
    }
    // return all neighbors
    else {
        neighborNodes = grid.getNeighbors(node, DiagonalMovement.Never);
        for (i = 0, l = neighborNodes.length; i < l; ++i) {
            neighborNode = neighborNodes[i];
            neighbors.push([neighborNode.x, neighborNode.y]);
        }
    }

    return neighbors;
};

module.exports = JPFNeverMoveDiagonally;

},{"../core/DiagonalMovement":30,"./JumpPointFinderBase":49}],48:[function(require,module,exports){
/**
 * @author aniero / https://github.com/aniero
 */
var DiagonalMovement = require('../core/DiagonalMovement');
var JPFNeverMoveDiagonally = require('./JPFNeverMoveDiagonally');
var JPFAlwaysMoveDiagonally = require('./JPFAlwaysMoveDiagonally');
var JPFMoveDiagonallyIfNoObstacles = require('./JPFMoveDiagonallyIfNoObstacles');
var JPFMoveDiagonallyIfAtMostOneObstacle = require('./JPFMoveDiagonallyIfAtMostOneObstacle');

/**
 * Path finder using the Jump Point Search algorithm
 * @param {Object} opt
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 * @param {DiagonalMovement} opt.diagonalMovement Condition under which diagonal
 *      movement will be allowed.
 */
function JumpPointFinder(opt) {
    opt = opt || {};
    if (opt.diagonalMovement === DiagonalMovement.Never) {
        return new JPFNeverMoveDiagonally(opt);
    } else if (opt.diagonalMovement === DiagonalMovement.Always) {
        return new JPFAlwaysMoveDiagonally(opt);
    } else if (opt.diagonalMovement === DiagonalMovement.OnlyWhenNoObstacles) {
        return new JPFMoveDiagonallyIfNoObstacles(opt);
    } else {
        return new JPFMoveDiagonallyIfAtMostOneObstacle(opt);
    }
}

module.exports = JumpPointFinder;

},{"../core/DiagonalMovement":30,"./JPFAlwaysMoveDiagonally":44,"./JPFMoveDiagonallyIfAtMostOneObstacle":45,"./JPFMoveDiagonallyIfNoObstacles":46,"./JPFNeverMoveDiagonally":47}],49:[function(require,module,exports){
/**
 * @author imor / https://github.com/imor
 */
var Heap       = require('heap');
var Util       = require('../core/Util');
var Heuristic  = require('../core/Heuristic');
var DiagonalMovement = require('../core/DiagonalMovement');

/**
 * Base class for the Jump Point Search algorithm
 * @param {object} opt
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 */
function JumpPointFinderBase(opt) {
    opt = opt || {};
    this.heuristic = opt.heuristic || Heuristic.manhattan;
    this.trackJumpRecursion = opt.trackJumpRecursion || false;
}

/**
 * Find and return the path.
 * @return {Array<Array<number>>} The path, including both start and
 *     end positions.
 */
JumpPointFinderBase.prototype.findPath = function(startX, startY, endX, endY, grid) {
    var openList = this.openList = new Heap(function(nodeA, nodeB) {
            return nodeA.f - nodeB.f;
        }),
        startNode = this.startNode = grid.getNodeAt(startX, startY),
        endNode = this.endNode = grid.getNodeAt(endX, endY), node;

    this.grid = grid;


    // set the `g` and `f` value of the start node to be 0
    startNode.g = 0;
    startNode.f = 0;

    // push the start node into the open list
    openList.push(startNode);
    startNode.opened = true;

    // while the open list is not empty
    while (!openList.empty()) {
        // pop the position of node which has the minimum `f` value.
        node = openList.pop();
        node.closed = true;

        if (node === endNode) {
            return Util.expandPath(Util.backtrace(endNode));
        }

        this._identifySuccessors(node);
    }

    // fail to find the path
    return [];
};

/**
 * Identify successors for the given node. Runs a jump point search in the
 * direction of each available neighbor, adding any points found to the open
 * list.
 * @protected
 */
JumpPointFinderBase.prototype._identifySuccessors = function(node) {
    var grid = this.grid,
        heuristic = this.heuristic,
        openList = this.openList,
        endX = this.endNode.x,
        endY = this.endNode.y,
        neighbors, neighbor,
        jumpPoint, i, l,
        x = node.x, y = node.y,
        jx, jy, dx, dy, d, ng, jumpNode,
        abs = Math.abs, max = Math.max;

    neighbors = this._findNeighbors(node);
    for(i = 0, l = neighbors.length; i < l; ++i) {
        neighbor = neighbors[i];
        jumpPoint = this._jump(neighbor[0], neighbor[1], x, y);
        if (jumpPoint) {

            jx = jumpPoint[0];
            jy = jumpPoint[1];
            jumpNode = grid.getNodeAt(jx, jy);

            if (jumpNode.closed) {
                continue;
            }

            // include distance, as parent may not be immediately adjacent:
            d = Heuristic.octile(abs(jx - x), abs(jy - y));
            ng = node.g + d; // next `g` value

            if (!jumpNode.opened || ng < jumpNode.g) {
                jumpNode.g = ng;
                jumpNode.h = jumpNode.h || heuristic(abs(jx - endX), abs(jy - endY));
                jumpNode.f = jumpNode.g + jumpNode.h;
                jumpNode.parent = node;

                if (!jumpNode.opened) {
                    openList.push(jumpNode);
                    jumpNode.opened = true;
                } else {
                    openList.updateItem(jumpNode);
                }
            }
        }
    }
};

module.exports = JumpPointFinderBase;

},{"../core/DiagonalMovement":30,"../core/Heuristic":32,"../core/Util":34,"heap":27}]},{},[4])