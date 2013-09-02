var GW = GW || {};

console.log('\'Allo \'Allo!');


// EXTENSIONS

THREE.Vector2.ZERO = new THREE.Vector2(0, 0);
THREE.Vector2.prototype.toAngle = function(){
  return Math.atan2(this.y, this.x);
}



// my classes

// SOUND

function Sound() {

}

// INPUT

var Input = {
  //keyboard: new KeyboardState(),
  // keyboardState: undefined,
  // lastKeyboardState: undefined,
  // mouseState: undefined,
  // lastMouseState: undefined,
  // gamepadState: undefined,
  // lastGamepadState: undefined,

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
    return THREE.Vector2.ZERO;
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
  this.prototype = new Entity();

  this.image = Art.Bullet;
  this.position = position;
  this.velocity = velocity;
  this.orientation = velocity.toAngle();
  this.radius = 8;

  this.update = function(){
    if (this.velocity.lengthSq() > 0)
      this.orientation = this.velocity.toAngle();

    this.position = this.position.add(this.velocity);

    // TODO
    // delete bullets that go off-screen
    // if (!GameRoot.Viewport.Bounds.Contains(Position.ToPoint()))
    //     IsExpired = true;
  }
}

// PLAYER SHIP

function PlayerShip() {
  Entity.call(this);

  this.image = Art.player;
  this.position = GameRoot.screenSize.divideScalar(2);
  this.radius = 10;
  this.cooldownFrames = 6;
  this.cooldownRemaining = 0;
  this.framesUntilRespawn = 0;
  this.image.scale.set(40, 40, 0);

  this.isDead = function(){
    return this.framesUntilRespawn > 0;
  }

  this.update = function(){

    if (this.isDead()){
      this.framesUntilRespawn--;
      return;
    }

    var aim = Input.getAimDirection();
    if (aim.lengthSq() > 0 && this.cooldownRemaining <= 0){
      // TODO: aim and bullet logic here
    }

    if (this.cooldownRemaining > 0){
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

    entities = _.filter(this.entities, function(x){ return !x.isExpired; });
    bullets = _.filter(this.bullets, function(x){ return !x.isExpired; });
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

// MAIN 

// function Main() {

// }





// var clock = new THREE.Clock();
// var keyboard = new KeyboardState();

// var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
// var renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setClearColor(0x000000, 1);
// document.body.appendChild(renderer.domElement);

// var geometry = new THREE.CubeGeometry(1, 1, 1);
// var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
// var cube = new THREE.Mesh(geometry, material);
//scene.add(cube);

//camera.position.z = 5;


// var texture = THREE.ImageUtils.loadTexture("/images/Bullet.png");
// var mat = new THREE.MeshBasicMaterial({color: 0xFFFFFF, ambient: 0xFFFFFF, map: texture});
// var sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 1, 1), mat);
// scene.add(sphere);

// var texture = THREE.ImageUtils.loadTexture("/images/Player.png");
// var mat = new THREE.SpriteMaterial({map: texture});
// var sprite = new THREE.Sprite(mat);
// sprite.scale.set(40, 40, 1.0);
// sprite.position.set(150, 150, 0);
// scene.add(sprite);


// magic happening here...

// there is no init!
init();
animate();



var test = new PlayerShip();
console.log(test);


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
  // cube.rotation.x += 0.1;
  // cube.rotation.y += 0.1;

  // //sphere.rotation.x += 0.1;
  // //sphere.rotation.y += 0.1;

  // keyboard.update();

  // var moveDistance = 50 * clock.getDelta();

  // if (keyboard.down("left"))
  //   cube.translateX(-50);

  // if (keyboard.down("right"))
  //   cube.translateX(50);

  // if (keyboard.down("A"))
  // {
  //   cube.translateX(-moveDistance);
  //   sprite.position.setX(sprite.position.x - moveDistance * 10);
  // }

  // if (keyboard.down("D"))
  // {
  //   cube.translateX(moveDistance);
  //   sprite.position.setX(sprite.position.x + moveDistance * 10);
  // }
}

function render() {
  GameRoot.renderer.render(GameRoot.scene, GameRoot.camera);
}

