var GW = GW || {};

console.log('\'Allo \'Allo!');

// extensions

THREE.Vector2.ZERO = new THREE.Vector2(0, 0);
THREE.Vector2.toAngle = function(){
  //return (float)Math.Atan2(vector.Y, vector.X);
  return Math.atan2(this.x, this.y);
}



// my classes

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

function Entity() {
  this.image = undefined; //THREE.ImageUtils.loadTexture( "textures/water.jpg" );  // Texture2D
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


function EntityManager() {
  this.entities = [];
  this.bullets = [];
  this.isUpdating = false;
  this.addedEntities = [];
  
  this.count = function(){
    return this.entities.length;
  }

  this.add = function(entity){
    if (!this.isUpdating)
      this.addEntity(entity);
    else
      this.addedEntities.push(entity);
  }

  this.addEntity = function(entity){
    this.entities.push(entity);
    if (entity instanceof Bullet)
      this.bullets.push(entity);
  }
}


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.CubeGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function render() {
  requestAnimationFrame(render);
  cube.rotation.x += 0.1;
  cube.rotation.y += 0.1;
  renderer.render(scene, camera);
}
render();


var test = new Entity();
console.log(test.orientation);


console.log('this is the end');
