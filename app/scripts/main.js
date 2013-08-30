var GW = GW || {};

console.log('\'Allo \'Allo!');

// extensions

THREE.Vector2.ZERO = new THREE.Vector2(0, 0);
THREE.Vector2.toAngle = function(){
  //return (float)Math.Atan2(vector.Y, vector.X);
  return Math.atan2(this.x, this.y);
}



// my classes

// SOUND

function Sound() {

}

// INPUT

var Input = {
  keyboard: new KeyboardState(),

  update: function(){

  },

  wasKeyPressed: function(){
    return false;
  },

  wasButtonPressed: function(){
    return false;
  },

  getMovementDirection: function(){
    return THREE.Vector2.ZERO;
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

function Art() {
  // TODO: these all need to be Texture2D
  this.player = undefined;
  this.seeker = undefined;
  this.wanderer = undefined;
  this.bullet = undefined;
  this.pointer = undefined;

  this.load = function(contentManager){
    // load each of those above here - possibly via the content manager
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
    return image === undefined ? THREE.Vector2.ZERO : new THREE.Vector2(this.image.width, this.image.height);
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
  this.prototype = new Entity();

  this.cooldownFrames = 6;
  this.cooldownRemaining = 0;
  this.framesUntilRespawn = 0;

  this.isDead = function(){
    return framesUntilRespawn > 0;
  }

  this.update = function(){
    if (this.isDead){
      this.framesUntilRespawn--;
      return;
    }

    var aim = Input.getAimDirection();
    if (aim.lengthSq() > 0 && this.cooldownRemaining <= 0){

    }

    if (this.cooldownRemaining > 0)
      this.cooldownRemaining--;

    var speed = 8;
    this.velocity = speed * Input.getMovementDirection();
    this.position = this.position.add(this.velocity);
    this.position = this.position.clamp(this.size/2, GameRoot.screenSize - this.size/2);

    if (this.velocity.lengthSq() > 0)
      this.orientation = this.velocity.toAngle();
  }

  this.draw = function(){

  }

  this.kill = function(){
    this.framesUntilRespawn = 60;
  }
}

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
  screenSize: new THREE.Vector2(window.innerWidth, window.innerHeight),

  initialize: function(){
    var ps = new PlayerShip();  // TODO: make this into and use singleton
    EntityManager.add(ps);
  }
}

// MAIN 

// function Main() {

// }





var clock = new THREE.Clock();
var keyboard = new KeyboardState();

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.CubeGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
var cube = new THREE.Mesh(geometry, material);
//scene.add(cube);

camera.position.z = 5;


// var texture = THREE.ImageUtils.loadTexture("/images/Bullet.png");
// var mat = new THREE.MeshBasicMaterial({color: 0xFFFFFF, ambient: 0xFFFFFF, map: texture});
// var sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 1, 1), mat);
// scene.add(sphere);

var texture = THREE.ImageUtils.loadTexture("/images/Player.png");
var mat = new THREE.SpriteMaterial({map: texture});
var sprite = new THREE.Sprite(mat);
sprite.scale.set(40, 40, 1.0);
sprite.position.set(150, 150, 0);
scene.add(sprite);


// magic happening here...

// there is no init!
init();
animate();



var test = new Entity();
console.log(test.orientation);


console.log('this is the end');



function init() {
  GameRoot.initialize();
}

function animate() {
  requestAnimationFrame(animate);
  render();
  update();
}

function update() {
  EntityManager.update();

  cube.rotation.x += 0.1;
  cube.rotation.y += 0.1;

  //sphere.rotation.x += 0.1;
  //sphere.rotation.y += 0.1;

  keyboard.update();

  var moveDistance = 50 * clock.getDelta();

  if (keyboard.down("left"))
    cube.translateX(-50);

  if (keyboard.down("right"))
    cube.translateX(50);

  if (keyboard.down("A"))
  {
    cube.translateX(-moveDistance);
    sprite.position.setX(sprite.position.x - moveDistance * 10);
  }

  if (keyboard.down("D"))
  {
    cube.translateX(moveDistance);
    sprite.position.setX(sprite.position.x + moveDistance * 10);
  }
}

function render() {
  renderer.render(scene, camera);
}

