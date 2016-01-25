// b2.js

import THREE from 'three';
import OBJLoader from './vendor/OBJLoader.js';

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
    const counters = new Object;
    counters.cameraMoveY = 0;
    let lights = [];

    const manager = new THREE.LoadingManager();
		manager.onProgress = function ( item, loaded, total ) {
			console.log( item, loaded, total );
		};

		let texture = new THREE.Texture();

		var onProgress = function ( xhr ) {
			if ( xhr.lengthComputable ) {
				var percentComplete = xhr.loaded / xhr.total * 100;
				console.log( Math.round(percentComplete, 2) + '% downloaded' );
			}
		};

		var onError = function ( xhr ) {
		};

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

    // const lightParameters = [
    //   [0xff0000, 0.5, [-100, 0, 900]],
    //   [0x7700FF, 0.5, [100, 0, 900]],
    // ]
    //
    // for (let i = 0; i < lightParameters.length; i++) {
    //   let light = new THREE.PointLight(
    //     lightParameters[i][0],
    //     lightParameters[i][1],
    //     2000
    //   );
    //
    //   light.position.set(
    //     lightParameters[i][2][0],
    //     lightParameters[i][2][1],
    //     lightParameters[i][2][2]
    //   );
    //
    //   lights.push(light);
    //   scene.add(light);
    // }

    const light = new THREE.PointLight(0xffffff, 1, 2000);
    light.position.set(0, 0, 900);
    scene.add(light);

    window.lights = lights;

    objects.cubes = [];
    objects.crystals = [];

    let material = new THREE.MeshPhongMaterial({
      shading: THREE.FlatShading,
      color: 0xaaaaaa
    });

    const loader = new THREE.OBJLoader(manager);
    loader.load('./obj/b2.obj', function (object) {
      object.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = material;
          child.position.set(0, 0, 700);
          child.scale.set(0.15, 0.15, 0.15);
          objects.crystals.push(child);
        }
      })


      scene.add(objects.crystals[0]);
    }, onProgress, onError);

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

    usefulThings = {camera: camera, scene: scene, renderer: renderer, mouse: mouse, objects: objects, counters: counters, lights: lights};

    let self = this;
    window.addEventListener(
      'resize',
      function() {self.onWindowResize(usefulThings)},
      false
    );

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
    let {
      objects,
      camera,
      counters,
      renderer,
      scene,
      mouse,
      lights
    } = usefulThings;

    for (let i = 0; i < objects.cubes.length; i++) {
      objects.cubes[i].rotation.x += Math.random() * .05;
      objects.cubes[i].rotation.y += Math.random() * .05;
    }

    for (let i = 0; i < objects.crystals.length; i++) {
      let crystal = objects.crystals[i];
      crystal.rotation.y += 0.05;
    }

    // for (let i = 0; i < lights.length; i++) {
    //   lights[i].intensity = Math.abs(Math.cos(counters.cameraMoveY + i));
    // }

    camera.position.y += (Math.cos(counters.cameraMoveY) * .2);
    counters.cameraMoveY += 0.02;

    renderer.render(scene, camera);

    return {camera: camera, scene: scene, renderer: renderer, mouse: mouse, objects: objects, counters: counters, lights: lights};
  }
};

module.exports = b2;
