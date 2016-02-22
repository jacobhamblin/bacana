// b4.js

import THREE from 'three';

const b4 = {
  animate: function(usefulThings) {
    let self = this;

    this.incrementCounters(usefulThings.counters);
    let newThings = this.render(usefulThings);

    if (document.querySelectorAll('canvas')[0]) {
      requestAnimationFrame(function() {self.animate(newThings)});
    }
  },
  incrementCounters: function(counters) {
    counters.a += 0.02;
  },
  init: function({container, renderer}) {
    console.log('initialized b4!');

    let usefulThings = this.setup({container, renderer});
    this.animate(usefulThings);
  },
  onMouseMove: function(mouse) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  },
  onWindowResize: function({camera, renderer}) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  },
  prepCamera: function () {
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      400
    );
    camera.position.set(0, 0, 100);
    camera.lookAt(0,0,0);

    return camera;
  },
  prepLights: function(scene) {
    const light = new THREE.PointLight(0x00ffff, 0.5, 1000);
    light.position.set(0,0,200);
    scene.add(light);

    return [light];
  },
  prepObjects: function({scene, counters}) {
    let objs = [];

      let mesh = new THREE.Mesh(
        new THREE.TetrahedronGeometry(50, 0),
        new THREE.MeshPhongMaterial({
          color: 0xffffff,
          shading: THREE.FlatShading
        })
      );
      mesh.position.set(
        0,
        0,
        0
      );
      mesh.rotation.set(
        Math.random() * 3,
        Math.random() * 3,
        Math.random() * 3
      )
      mesh.geometry.verticesNeedUpdate = true;
      mesh.geometry.dynamic = true;
      mesh.motion = function(i) { return Math.tan((counters.a) + i * 0.02) };

      scene.add(mesh);
      objs.push(mesh);

    return objs;
  },
  prepRenderer: function({container, renderer}) {
    renderer.setClearColor(0xf7f7f7);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    return renderer;
  },
  prepScene: function () {
    const scene = new THREE.Scene();

    return scene;
  },
  pulsateBigSphere: function(objs) {
      for (let i = 0; i < objs[0].geometry.vertices.length; i++) {
        let vertex = objs[0].geometry.vertices[i];

        vertex.set(
          vertex.x += objs[0].motion(i),
          vertex.y += objs[0].motion(i),
          vertex.z += objs[0].motion(i)
        );
      }

      objs[0].geometry.verticesNeedUpdate = true;
      objs[0].geometry.dynamic = true;
  },
  render: function(usefulThings) {
    let {
      objects, counters, raycasterObj, mouse, camera, scene, renderer, lights
    } = usefulThings;

    this.pulsateBigSphere(objects.obj1Arr);

    renderer.render(scene, camera);

    return usefulThings;
  },
  setup: function({container, renderer}) {
    let self = this;
    const usefulThings = new Object, raycasterObj = new Object, counters = new Object, objects = new Object, lights = new Object;
    const mouse = new THREE.Vector2();
    counters.a = 0;

    const camera = this.prepCamera();
    const scene = this.prepScene();
    renderer = this.prepRenderer({container, renderer});

    objects.obj1Arr = this.prepObjects({scene, counters});
    lights.lights = this.prepLights(scene);

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

    return {objects, counters, raycasterObj, mouse, camera, scene, renderer, lights}
  }
};

export default b4;
