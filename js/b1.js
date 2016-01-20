// b1.js

import THREE from 'three';

const b1 = {
  init: function (container) {
    let usefulThings = this.setup(container);
    this.animate(usefulThings);
  },
  setup: function (container) {
    console.log('initialized b1!');

    let camera, scene, raycaster, renderer;
    let mouse = new THREE.Vector2(), INTERSECTED;
    let objects = new Object;
    let usefulThings = new Object;
    let objectsInfo = {count: 64, radius: 5, sphereRadius: 15};
    const counters = new Object;
    counters.a = 0;

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

    objects.tetrahedrons = [];

    for (let i = 0; i < objectsInfo.count; i++) {

      const geometry = new THREE.TetrahedronGeometry(objectsInfo.radius, 0);
      const material = new THREE.MeshLambertMaterial({
        color: 0xbbbbbb,
      });
      const object = new THREE.Mesh(geometry, material);
      const phi = Math.acos( -1 + ( 2 * i ) / objectsInfo.count );
      const theta = Math.sqrt( objectsInfo.count * Math.PI ) * phi;

      const spherePositions = [
        objectsInfo.sphereRadius * Math.cos(theta) * Math.sin(phi),
        objectsInfo.sphereRadius * Math.sin(theta) * Math.sin(phi),
        objectsInfo.sphereRadius * Math.cos(phi)
      ];



      object.position.set(
        spherePositions[0],
        spherePositions[1],
        spherePositions[2] + 750
      );

      objects.tetrahedrons.push(object);
      scene.add(object);
    }

    usefulThings = {camera: camera, scene: scene, renderer: renderer, mouse: mouse, objects: objects, counters: counters};

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
    let { objects, camera, counters, renderer, scene, mouse } = usefulThings;
    for (let i = 0; i < objects.tetrahedrons.length; i++) {
      objects.tetrahedrons[i].rotation.y += (Math.cos(counters.a) * .05);
    }

    counters.a += 0.02;

    renderer.render(scene, camera);

    return {camera: camera, scene: scene, renderer: renderer, mouse: mouse, objects: objects, counters: counters};
  }
};

module.exports = b1;
