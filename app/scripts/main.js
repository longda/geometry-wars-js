var GW = GW || {};
GW.Random = GW.Random || {};
GW.Math = GW.Math || {};

console.log('\'Allo \'Allo!');


// EXTENSIONS

THREE.Vector2.ZERO = new THREE.Vector2(0, 0);
THREE.Vector2.prototype.toAngle = function(){
  return Math.atan2(this.y, this.x);
}
GW.Random.NextFloat = function(min, max){
  return Math.random() * (max - min) + min;
}
GW.Math.FromPolar = function(angle, magnitude){
  return new THREE.Vector2(Math.cos(angle), Math.sin(angle)).multiplyScalar(magnitude);
}
GW.Math.Transform = function(value, rotation){
  // value == vector2
  // rotation == quaternion
  var output = new THREE.Vector2(0, 0);
  var x = rotation.x + rotation.x;
  var y = rotation.y + rotation.y;
  var z = rotation.z + rotation.z;
  var w = rotation.w * z;
  var single = rotation.x * x;
  var x1 = rotation.x * y;
  var y1 = rotation.y * y;
  var z1 = rotation.z * z;
  var single1 = value.x * (1.0 - y1 - z1) + value.y * (x1 - w);
  var x2 = value.x * (x1 + w) + value.y * (1.0 - single - z1);
  output.x = single1;
  output.y = x2;

  return output;
}



// my classes

// SOUND

function Sound() {

}

// INPUT

var Input = {
  keyboard: new KeyboardState(),
  keyboardState: undefined,
  lastKeyboardState: undefined,
  mouseState: undefined,
  lastMouseState: undefined,
  gamepadState: undefined,
  lastGamepadState: undefined,
  isAimingWithMouse: false,

  mousePosition: function(){
    return THREE.Vector2.ZERO;
  },

  update: function(){

  },

  wasKeyPressed: function(){
    return false;
  },

  wasButtonPressed: function(){
    return false;
  },

  getMovementDirection: function(){
    var direction = new THREE.Vector2(0, 0);

    if (GameRoot.keyboard.down("A"))
    {
      direction.x -= 1;
    }

    if (GameRoot.keyboard.down("D"))
    {
      direction.x += 1;
    }

    if (GameRoot.keyboard.down("W"))
    {
      direction.y -= 1;
    }

    if (GameRoot.keyboard.down("S"))
    {
      direction.y += 1;
    }

    // Clamp the length of the vector to a maximum of 1.
    if (direction.lengthSq() > 1)
    {
      direction = direction.normalize();
    }

    return direction;
  },

  getAimDirection: function(){
    if (this.isAimingWithMouse) return getMouseAimDirection();

    var direction = new THREE.Vector2(0, 0);

    if (GameRoot.keyboard.down("left"))
    {
      direction.x -= 1;
    }

    if (GameRoot.keyboard.down("right"))
    {
      direction.x += 1;
    }

    if (GameRoot.keyboard.down("up"))
    {
      direction.y -= 1;
    }

    if (GameRoot.keyboard.down("down"))
    {
      direction.y += 1;
    }

    return direction === THREE.Vector2.ZERO ? THREE.Vector2.ZERO : direction.normalize();
  },

  getMouseAimDirection: function(){
    return THREE.Vector2.ZERO;
  },

  wasBombButtonPressed: function(){
    return false;
  }
}

// ART

var Art = {
  // TODO: these all need to be Texture2D/THREE.SPRITE

  player: undefined,
  seeker: undefined,
  wanderer: undefined,
  bullet: undefined,
  pointer: undefined,

  load: function(){
    // load each of those above here - possibly via the content manager

    var texture = THREE.ImageUtils.loadTexture("/images/Player.png");
    var mat = new THREE.SpriteMaterial({map: texture});
    this.player = new THREE.Sprite(mat);

    texture = THREE.ImageUtils.loadTexture("/images/Seeker.png");
    mat = new THREE.SpriteMaterial({map: texture});
    this.seeker = new THREE.Sprite(mat);

    texture = THREE.ImageUtils.loadTexture("/images/Wanderer.png");
    mat = new THREE.SpriteMaterial({map: texture});
    this.wanderer = new THREE.Sprite(mat);

    texture = THREE.ImageUtils.loadTexture("/images/Bullet.png");
    mat = new THREE.SpriteMaterial({map: texture});
    this.bullet = new THREE.Sprite(mat);

    texture = THREE.ImageUtils.loadTexture("/images/pointer.png");
    mat = new THREE.SpriteMaterial({map: texture});
    this.pointer = new THREE.Sprite(mat);
  }
}

// ENTITY

function Entity() {
  this.image = undefined; // TODO: THREE.ImageUtils.loadTexture( "textures/water.jpg" );  // Texture2D
  this.color = new THREE.Color('white');  // Color
  this.position = new THREE.Vector2(0, 0);  // Vector2
  this.velocity = new THREE.Vector2(0, 0);  // Vector2
  this.orientation = 0;
  this.radius = 20;
  this.isExpired = false;
  
  this.size = function(){
    return this.image === undefined ? THREE.Vector2.ZERO : new THREE.Vector2(this.image.width, this.image.height);
  }

  this.update = function(){

  }

  this.draw = function(){

  }
}

// BULLET

function Bullet(position, velocity) {
  Entity.call(this);

  this.image = Art.bullet;
  this.position = position.clone();
  this.velocity = velocity.clone();
  this.orientation = velocity.toAngle();
  this.radius = 8;
  this.image.scale.set(28, 9, 0);  // TODO: base this off the image inside Art.bullet

  this.update = function(){
    if (this.velocity.lengthSq() > 0)
    {
      this.orientation = this.velocity.toAngle();
    }

    this.position.add(this.velocity);

    // draw logic
    this.image.position.set(this.position.x, this.position.y, 0);
    this.image.rotation = this.orientation;

    // console.log('position.x: ', this.position.x);
    // console.log('screensize.x: ', GameRoot.screenSize.x);
    // console.log('position.y: ', this.position.y);
    // console.log('screensize.y: ', GameRoot.screenSize.y);
    // console.log('isExpired: ', this.isExpired);

    if (!(0 < this.position.x && this.position.x < GameRoot.screenSize.x && 0 < this.position.y && this.position.y < GameRoot.screenSize.y))
    {
      //this.isExpired = true;  // TODO: add this back in..  was not removing from screen but removing from EntityManager right away.
    }
  }
}

Bullet.prototype = Object.create(Entity.prototype);

// PLAYER SHIP

function PlayerShip() {
  Entity.call(this);

  this.image = Art.player;
  this.position = GameRoot.screenSize.divideScalar(2);
  //console.log('playership position: ', this.position);
  this.radius = 10;
  this.cooldownFrames = 6;
  this.cooldownRemaining = 0;
  this.framesUntilRespawn = 0;
  this.image.scale.set(40, 40, 0);  // TODO: base this off the image inside Art.player

  this.isDead = function(){
    return this.framesUntilRespawn > 0;
  }

  this.update = function(){

    if (this.isDead()){
      this.framesUntilRespawn--;
      return;
    }

    var aim = Input.getAimDirection();
    if (aim.lengthSq() > 0 && this.cooldownRemaining <= 0)
    {
      this.cooldownRemaining = this.cooldownFrames;
      var aimAngle = aim.toAngle();
      var aimQuat = new THREE.Quaternion(0, 0, aimAngle);

      var randomSpread = GW.Random.NextFloat(-0.04, 0.04) + GW.Random.NextFloat(-0.04, 0.04);
      var vel = GW.Math.FromPolar(aimAngle + randomSpread, 11.0);

      var offset = GW.Math.Transform(new THREE.Vector2(35, -8), aimQuat);
      EntityManager.add(new Bullet(this.position.clone().add(offset), vel));

      offset = GW.Math.Transform(new THREE.Vector2(35, 8), aimQuat);
      EntityManager.add(new Bullet(this.position.clone().add(offset), vel));

      // TODO: play sound
    }

    if (this.cooldownRemaining > 0)
    {
      this.cooldownRemaining--;
    }

    var speed = 8;
    this.velocity = Input.getMovementDirection().multiplyScalar(speed);
    this.position = this.position.add(this.velocity);
    this.position = this.position.clamp(this.size/2, GameRoot.screenSize - this.size/2);
    //this.position = this.position.clamp(this.size().divideScalar(2), GameRoot.screenSize.addScalar(this.size().divideScalar(2).negate()));

    if (this.velocity.lengthSq() > 0){
      // invert the y-axis here? -- note: this was in the input class before but was influencing direction rather than orientation
      this.velocity.y *= -1;

      this.orientation = this.velocity.toAngle();
      //console.log(this.orientation);
    }

    // TODO: update image (sprite) with latest values as if this were the draw method
    //console.log(this);

    // TODO: remove the draw loop?
    //if (this.isExpired) this.image.scale.set(0, 0, 0);

    this.image.position.set(this.position.x, this.position.y, 0);
    this.image.rotation = this.orientation;
  }

  this.draw = function(){

  }

  this.kill = function(){
    this.framesUntilRespawn = 60;
  }
}

PlayerShip.prototype = Object.create(Entity.prototype);


// ENTITY MANAGER

var EntityManager = {
  entities: [],
  bullets: [],
  isUpdating: false,
  addedEntities: [],
  
  count: function(){
    return this.entities.length;
  },

  add: function(entity){
    if (!this.isUpdating)
      this.addEntity(entity);
    else
      this.addedEntities.push(entity);
  },

  addEntity: function(entity){
    this.entities.push(entity);
    if (entity instanceof Bullet)
      this.bullets.push(entity);

    GameRoot.scene.add(entity.image);

    console.log('entity manager count is: ', this.count());
  },

  update: function(){
    isUpdating = true;

    _.each(this.entities, function(element, index, array){
      element.update();
    });

    isUpdating = false;

    _.each(this.addedEntities, function(element, index, array){
      addEntity(element);
    });

    addedEntities = [];

    this.entities = _.filter(this.entities, function(x){ return !x.isExpired; });
    this.bullets = _.filter(this.bullets, function(x){ return !x.isExpired; });

    // var expired = [];
    // expired = _.filter(this.entities, function(x){ return x.isExpired; });
    // expired = _.filter(this.bullets, function(x){ return x.isExpired; });
    // _.each(expired, function(element, index, array){
    //   delete element;
    // });
    // expired = [];
  },

  draw: function(){

  }
}

// GAME ROOT

var GameRoot = {
  clock: new THREE.Clock(),
  keyboard: new KeyboardState(),
  screenSize: new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene: new THREE.Scene(),
  camera: new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000),
  renderer: new THREE.WebGLRenderer(),

  initialize: function(){
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 1);
    document.body.appendChild(this.renderer.domElement);

    this.camera.position.z = 5;

    //console.log('screensize: ', this.screenSize);
    //console.log('camera: ', this.camera);

    var ps = new PlayerShip();  // TODO: make this into and use singleton
    EntityManager.add(ps);
  }
}


// magic happening here...
init();
animate();



// var test = new PlayerShip();
// console.log(test);


console.log('this is the end');



function init() {
  Art.load();
  GameRoot.initialize();
}

function animate() {
  requestAnimationFrame(animate);
  render();
  update();
}

function update() {
  GameRoot.keyboard.update();
  EntityManager.update();
}

function render() {
  GameRoot.renderer.render(GameRoot.scene, GameRoot.camera);
}

