// b3.js

import THREE from 'three';

const b3 = {
  init: function (container, renderer) {
    let usefulThings = this.setup(container, renderer);
    this.animate(usefulThings);
  },
  setup: function (container, renderer) {
    console.log('initialized b3!');

    let camera, scene;
    let mouse = new THREE.Vector2();
    const objects = new Object;
    let usefulThings = new Object;
    const objectsInfo = {count: 1, radius: 15};
    const counters = new Object;
    let lightsObj = new Object;

    camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      400
    );
    camera.position.set(0, 0, 800);
    camera.lookAt(0,0,0);

    scene = new THREE.Scene();

    renderer.setClearColor(0x222222);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    lightsObj.lights = [];

    const lightOne = new THREE.PointLight(0xffffff, 1, 2000);
    lightOne.position.set(0, 0, 400);
    lightsObj.lights.push(lightOne);
    scene.add(lightOne);

    const lightTwo = new THREE.PointLight(0xffffff, 1, 2000);
    lightTwo.position.set(-100,-100,900);
    lightsObj.lights.push(lightTwo);
    scene.add(lightTwo);

    const bigSphereGeom = new THREE.SphereGeometry(100);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff
    });
    const bigSphere = new THREE.Mesh(bigSphereGeom, material);
    bigSphere.position.set(0,0,700);
    objects.bigSphere = bigSphere;
    scene.add(bigSphere);

    usefulThings = {
      camera,
      scene,
      renderer,
      mouse,
      objects,
      counters,
      lightsObj
    };

    let self = this;
    window.addEventListener(
      'resize',
      function() {self.onWindowResize(usefulThings)},
      false
    );
    window.addEventListener(
      'mousemove',
      function() {self.onMouseMove(usefulThings)},
      false
    );

    return usefulThings;
  },
  onMouseMove: function(usefulThings) {
    const { mouse } = usefulThings;
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  },
  onWindowResize: function(usefulThings) {
    let { camera, renderer } = usefulThings;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  },
  animate: function(usefulThings) {
    let self = this;

    let newThings = this.render(usefulThings);

    if (document.querySelectorAll('canvas')[0]) {
      requestAnimationFrame(function() {self.animate(newThings)});
    }
  },
  render: function(usefulThings) {
    let {
      objects,
      camera,
      counters,
      renderer,
      scene,
      mouse,
      lightsObj
    } = usefulThings;



    renderer.render(scene, camera);

    return {camera, scene, renderer, mouse, objects, counters, lightsObj};
  }
};

module.exports = b3;
