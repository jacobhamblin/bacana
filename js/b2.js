// b2.js

import THREE from 'three';

const b2 = {
  init: function (container) {
    let usefulThings = this.setup(container);
    this.animate(usefulThings);
  },
  setup: function (container) {
    console.log('initialized b2!');

    let camera, scene, raycaster, renderer;
    let mouse = new THREE.Vector2(), INTERSECTED;
    let objects = new Object;
    let usefulThings = new Object;
    let cubeCount = 5;
    let cameraMoveY = 0;

    camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / (window.innerHeight - 3),
      1,
      400
    );
    camera.position.set(0, 0, 800);
    camera.lookAt(0,0,0);

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x222222);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight - 3);
    container.appendChild(renderer.domElement);

    const light = new THREE.PointLight(0xffffff, 1, 2000);

    light.position.set(0, 0, 900);

    scene.add(light);

    objects.cubes = [];

    for (let i = 0; i < cubeCount; i++) {
      let geometry = new THREE.BoxGeometry(10, 10, 10);
      let material = new THREE.MeshDepthMaterial({wireframe: true});
      let cube = new THREE.Mesh(geometry, material);
      cube.position.set(
        Math.random() * 200 - 100,
        Math.random() * 200 - 100,
        (Math.random() * 200 - 100) + 600);
      objects.cubes.push(cube);
      scene.add(cube);
    }

    usefulThings = {camera: camera, scene: scene, renderer: renderer, mouse: mouse, objects: objects, cameraMoveY: cameraMoveY};

    window.addEventListener('resize', this.onWindowResize(usefulThings), false);

    return usefulThings;
  },
  onWindowResize: function(usefulThings) {
    let { camera, renderer } = usefulThings;

    camera.aspect = window.innerWidth / (window.innerHeight - 3);
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight - 3);
  },
  animate: function(usefulThings) {
    let self = this;

    let newThings = this.render(usefulThings);

    if (document.querySelectorAll('canvas')[0]) {
      requestAnimationFrame(function() {self.animate(newThings)});
    }
  },
  render: function(usefulThings) {
    let { objects, camera, cameraMoveY, renderer, scene, mouse } = usefulThings;
    for (let i = 0; i < objects.cubes.length; i++) {
      objects.cubes[i].rotation.x += Math.random() * .05;
      objects.cubes[i].rotation.y += Math.random() * .05;
    }

    camera.position.y += (Math.cos(cameraMoveY) * .2);
    console.log(camera.position + ' ' + camera.position.y)
    cameraMoveY += 0.02;

    renderer.render(scene, camera);

    return {camera: camera, scene: scene, renderer: renderer, mouse: mouse, objects: objects, cameraMoveY: cameraMoveY};
  }
};

module.exports = b2;
