import THREE from 'three';

import OrbitControls from './vendor/OrbitControls.js';

const bScene = {
  camera: null,
  container: null,
  controls: null,
  counters: {a: 0, b: 0},
  lights: {},
  mouse: new THREE.Vector2(),
  objects: {},
  raycaster: {
    raycaster: new THREE.Raycaster(),
    intersection: false
  },
  renderer: null,
  scene: new THREE.Scene(),
  ended: false,

  animate(fn) {
    this.render(fn)

    if (document.querySelectorAll('canvas')[0]) {
      this.animFrameReq = requestAnimationFrame( function() {this.animate(fn)}.bind(this) )
    }
  },
  create({container, renderer}) {
    const bScene = Object.create(this);
    bScene.container = container;
    bScene.renderer = renderer;
    return bScene;
  },
  destroy () {
    cancelAnimationFrame(this.animFrameReq);
    this.scene = null;
    this.projector = null;
    this.camera = null;
    this.controls = null;
    this.objects = null;
    this.lights = null;
    this.counters = null;
    this.raycaster = null;
    this.ended = true;
  },
  init () {
    this.standardSetup()
    const fn = this.uniqueSetup()
    this.animate(fn)
  },
  prepCamera () {
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      400
    );
    camera.position.set(0, 0, 50);
    camera.lookAt(0,0,0);

    this.camera = camera;
  },
  prepControls () {
    this.controls = new OrbitControls(
      this.camera, this.renderer.domElement
    );
    this.controls.rotateSpeed = 1;
    this.controls.enablePan = false;
  },
  prepRenderer () {
    this.renderer.setClearColor(0x222222);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);
  },
  prepScene () {
    const scene = new THREE.Scene();

    this.scene = scene;
  },
  onMouseMove () {
    event.preventDefault();
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		this.mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
  },
  onWindowResize () {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  },
  render(fn) {
    if (this.ended) return
    if (this.controls) this.controls.update();
    if (fn) fn();


    this.renderer.render(this.scene, this.camera);
  },
  standardSetup () {
    this.prepRenderer()
    this.prepScene()
    this.prepCamera()
    this.prepControls()

    window.addEventListener(
      'resize',
      function() { this.onWindowResize() }.bind(this),
      false
    );
    window.addEventListener(
      'mousemove',
      function() { this.onMouseMove() }.bind(this),
      false
    );
  },
  uniqueSetup () {
    // prep this scene
  }
}

export default bScene;
