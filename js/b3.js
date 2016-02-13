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
    const objectsInfo = {
      bubbles: {count: 50, radius: 10}
    };
    const counters = new Object;
    let lightsObj = new Object;
    counters.a = 0;

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
    lightOne.position.set(0, 0, 600);
    lightsObj.lights.push(lightOne);
    scene.add(lightOne);

    const lightTwo = new THREE.PointLight(0xffffff, 1, 2000);
    lightTwo.position.set(-100,-100,900);
    lightsObj.lights.push(lightTwo);
    scene.add(lightTwo);

    const bigSphereGeom = new THREE.SphereGeometry(50, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0x333333
    });
    const bigSphere = new THREE.Mesh(bigSphereGeom, material);
    bigSphere.geometry.verticesNeedUpdate = true;
    bigSphere.geometry.dynamic = true;
    bigSphere.position.set(0,0,700);
    scene.add(bigSphere);
    objects.bigSphere = bigSphere;
    window.bigSphere = bigSphere;
    window.scene = scene;

    // let vertices = [];
    // for (let i = 0; i < bigSphere.geometry.vertices.length; i+=6) {
    //   let vertex = bigSphere.geometry.vertices[i].clone();
    //   let realVertex = vertex.applyMatrix4(bigSphere.matrixWorld)
    //   if (realVertex.x < 0) {
    //     vertices.push(realVertex);
    //   }
    // }

    // objects.bubbles = [];
    // for (let i = 0; i < vertices.length; i++) {
    //   const geom = new THREE.SphereGeometry(3, 8, 8);
    //   const mat = new THREE.MeshPhongMaterial({
    //     color: 0xffffff
    //   });
    //   const bubble = new THREE.Mesh(geom, mat);
    //   bubble.position.set(
    //     vertices[i][0],
    //     vertices[i][1],
    //     vertices[i][2] + 750
    //   )
    //   scene.add(bubble);
    //   objects.bubbles.push(bubble);
    // }

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

    if (document.querySelector('canvas')) {
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

    scene.updateMatrixWorld();

    counters.a += 0.02;

    for (let i = 0; i < objects.bigSphere.geometry.vertices.length; i++) {
      let vertex = objects.bigSphere.geometry.vertices[i];

      vertex.set(
        vertex.x += (Math.cos(counters.a + i)),
        vertex.y += (Math.cos(counters.a + i)),
        vertex.z += (Math.cos(counters.a + i))
      )
    }

    bigSphere.geometry.verticesNeedUpdate = true;
    bigSphere.geometry.dynamic = true;

    // objects.bigSphere.rotation.x += 0.02;

    renderer.render(scene, camera);

    return {camera, scene, renderer, mouse, objects, counters, lightsObj};
  }
};

module.exports = b3;
