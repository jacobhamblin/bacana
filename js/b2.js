// b2.js

import THREE from 'three';
import OBJLoader from './vendor/OBJLoader.js';

const b2 = {
  animate: function(usefulThings) {
    let self = this;

    let newThings = this.render(usefulThings);

    if (document.querySelectorAll('canvas')[0]) {
      requestAnimationFrame(function() {self.animate(newThings)});
    }
  },
  applyMaterial: function(object, color) {
    let material = new THREE.MeshPhongMaterial({
      shading: THREE.FlatShading,
      color: color
    });

    object.material = material;
    return object;
  },
  crystalClicked: function(counters) {
    counters.clicked = counters.frame;
    // render method calls switchActiveCrystal when seven frames have passed
  },
  handleRaycasterIntersection: function(usefulThings) {
    let {raycasterObj, mouse, camera, scene, objects, counters} = usefulThings;

    raycasterObj.raycaster.setFromCamera(mouse, camera);
    let intersects = raycasterObj.raycaster.intersectObjects(scene.children);

    let tempIntersection = false;
    if (intersects.length > 0) {
      for (let i = 0; i < objects.crystals.length; i++) {
        if (objects.crystals[i] === intersects[0].object) {
          tempIntersection = true;
        }
      }
      raycasterObj.intersection = tempIntersection;
      if (raycasterObj.intersection === false) {
        this.mouseleaveCrystal(usefulThings);
      } else {
        this.mouseenterCrystal(usefulThings);
      }
    } else {
      raycasterObj.intersection = tempIntersection;
      if (raycasterObj.intersection === false) {
        this.mouseleaveCrystal(usefulThings);
      }
    }

    if (raycasterObj.intersection) {
      let val = counters.frame % 2 === 0 ? (Math.cos(counters.cosY) * 2) : -(Math.cos(counters.cosY) * 2);
      objects.crystals[objects.activeCrystal].position.x += val;
    }
  },
  init: function ({container, renderer}) {
    let usefulThings = this.setup({container, renderer});
    this.animate(usefulThings);
  },
  mouseenterCrystal: function (usefulThings) {
    let { raycasterObj, objects } = usefulThings;
    document.body.style.cursor = "pointer";
  },
  mouseleaveCrystal: function (usefulThings) {
    let { raycasterObj, objects } = usefulThings;
    if (
      objects.crystals[objects.activeCrystal] &&
      raycasterObj.intersection === false
    ) {
      objects.crystals[objects.activeCrystal].position.x = 0;
      document.body.style.cursor = "initial";
    }
  },
  onWindowResize: function({camera, renderer}) {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  },
  onMouseMove: function(mouse) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  },
  onMouseClick: function({raycasterObj, counters}) {
    let self = this;
    if (raycasterObj.intersection) {
      self.crystalClicked(counters);
    }
  },
  prepCamera: function() {
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      400
    );
    camera.position.set(0, 0, 800);
    camera.lookAt(0,0,0);

    return camera;
  },
  prepCrystals: function({objects, scene}) {
    const self = this;

    const manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {
      console.log( item, loaded, total );
    };


    var onProgress = function ( xhr ) {
      if ( xhr.lengthComputable ) {
        var percentComplete = xhr.loaded / xhr.total * 100;
        console.log( Math.round(percentComplete, 2) + '% downloaded' );
      }
    };

    var onError = function ( xhr ) {
    };


    objects.crystals = [];

    const icosahedronGeom = new THREE.IcosahedronGeometry(250, 3);
    const icosahedronMat = new THREE.MeshDepthMaterial({
      wireframe: true
    });
    let icosahedron = new THREE.Mesh(icosahedronGeom, icosahedronMat);
    icosahedron.position.set(0,0,700);
    scene.add(icosahedron);
    objects.icosahedron = icosahedron;

    let loadedCount = 0;
    let crystalObjects = ['./obj/b2_1.obj', './obj/b2_2.obj', './obj/b2_3.obj'];
    let colors = [0xaaaaaa, 0x777777, 0xaaaaaa];
    const loader = new THREE.OBJLoader(manager);
    for (let i = 0; i < crystalObjects.length; i++) {
      loader.load(crystalObjects[i], function (object) {
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child = self.applyMaterial(child, colors[i]);
            child.position.set(0, 0, 700);
            child.scale.set(0.15, 0.15, 0.15);
            objects.crystals.push(child);
            loadedCount++;
          }
        });

        if (loadedCount === crystalObjects.length) {
          objects.activeCrystal = 0;
          scene.add(objects.crystals[objects.activeCrystal]);
        }
      }, onProgress, onError);
    }
  },
  prepLights: function({scene, lightsObj}) {
    const lightParameters = [
      [0xff0000, 0.5, [-100, 0, 900]],
      [0x7700FF, 0.5, [100, 0, 900]],
    ]

    lightsObj.colors = [
      [0xff0000, 0x7700ff],
      [0xcc00ff, 0x00aaff],
      [0x0000ff, 0x00ff00]
    ];

    let lights = [];
    for (let i = 0; i < lightParameters.length; i++) {
      let light = new THREE.PointLight(
        lightParameters[i][0],
        lightParameters[i][1],
        2000
      );

      light.position.set(
        lightParameters[i][2][0],
        lightParameters[i][2][1],
        lightParameters[i][2][2]
      );

      lights.push(light);
      scene.add(light);
    }

    return lights;
  },
  prepRenderer: function({container, renderer}) {
    renderer.setClearColor(0x222222);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    return renderer;
  },
  prepScene: function() {
    const scene = new THREE.Scene();

    return scene;
  },
  pulsateLights: function({lights, counters, mouse}) {
    for (let i = 0; i < lights.length; i++) {
      let intensities = Math.abs(Math.cos((counters.cosY * 10) + i));
      let calculation = (1 - Math.abs(mouse.x));
      let intensity = (calculation > 0.3 ? ((calculation - 0.3) * 2) : 0);
      lights[i].intensity = (intensities * (intensity));
    }
  },
  rollIcosahedron: function({icosahedron, mouse}) {
    icosahedron.rotation.y += (mouse.x * 0.004);
    icosahedron.rotation.x += (mouse.y * 0.004);
  },
  render: function(usefulThings) {
    let {
      objects,
      camera,
      counters,
      renderer,
      scene,
      mouse,
      lightsObj,
      raycasterObj
    } = usefulThings;
    let self = this;

    this.shakeOrSwapCrystal({objects, counters, scene, lightsObj});

    counters.floatingCrystalPos += (Math.cos(counters.cosY) * 0.2);
    counters.cosY += 0.02;

    let lights = lightsObj.lights;
    this.pulsateLights({lights, counters, mouse});

    this.handleRaycasterIntersection(usefulThings);

    let icosahedron = objects.icosahedron;
    this.rollIcosahedron({icosahedron, mouse});

    renderer.render(scene, camera);
    counters.frame++;

    return {camera, scene, renderer, mouse, objects, counters, lightsObj, raycasterObj};
  },
  setup: function ({container, renderer}) {
    console.log('initialized b2!');

    let mouse = new THREE.Vector2();
    let objects = new Object;
    let usefulThings = new Object;
    let raycasterObj = new Object;
    let cubeCount = 5;
    const counters = new Object;
    counters.cosY = 0;
    counters.frame = 0;
    let lightsObj = new Object;
    lightsObj.lights = [];
    let self = this;
    counters.floatingCrystalPos = 0;
    counters.clicked = -4;

    const camera = this.prepCamera();
    const scene = this.prepScene();
    raycasterObj.raycaster = new THREE.Raycaster();
    raycasterObj.intersection = false;
    renderer = this.prepRenderer({container, renderer});

    lightsObj.lights = this.prepLights({scene, lightsObj});

    const light = new THREE.PointLight(0xffffff, 1, 2000);
    light.position.set(0, 0, 900);
    scene.add(light);

    this.prepCrystals({scene, objects});

    usefulThings = {camera, scene, renderer, mouse, objects, counters, lightsObj, raycasterObj};

    window.addEventListener(
      'resize',
      function() {self.onWindowResize({camera, renderer})},
      false
    );
    window.addEventListener(
      'mousemove',
      function() {self.onMouseMove(mouse)},
      false
    );
    window.addEventListener(
      'click',
      function() {self.onMouseClick({raycasterObj, counters})},
      false
    );

    return usefulThings;
  },
  shakeOrSwapCrystal: function({lightsObj, objects, counters, scene}) {
    if (typeof objects.activeCrystal === typeof 1) {
      objects.crystals[objects.activeCrystal].rotation.y += 0.05;
      objects.crystals[objects.activeCrystal].position.y = counters.floatingCrystalPos;
      if (
        (counters.frame <= counters.clicked + 7) &&
        (counters.frame > counters.clicked)
      ) {
        objects.crystals[objects.activeCrystal]
          .position.x += (Math.random() * 10) - 5;
        objects.crystals[objects.activeCrystal]
          .position.y += (Math.random() * 10) - 5;
      } else if (counters.frame === (counters.clicked + 8)) {
        this.switchActiveCrystal({lightsObj, scene, objects});
      }
    }
  },
  switchActiveCrystal: function({lightsObj, scene, objects}) {
    let self = this;

    objects.crystals[objects.activeCrystal].position.x = 0;
    scene.remove(objects.crystals[objects.activeCrystal]);
    objects.activeCrystal = (objects.activeCrystal + 1) % objects.crystals.length;
    scene.add(objects.crystals[objects.activeCrystal]);

    for (let i = 0; i < lightsObj.lights.length; i++) {
      lightsObj.lights[i].color = new THREE.Color(lightsObj.colors[objects.activeCrystal][i]);
    }
  }
};

module.exports = b2;
