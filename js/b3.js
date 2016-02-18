// b3.js

import THREE from 'three';

const b3 = {
  animate: function(usefulThings) {
    let self = this;

    let newThings = this.render(usefulThings);

    if (document.querySelector('canvas')) {
      requestAnimationFrame(function() {self.animate(newThings)});
    }
  },
  changeMaterial: function(mesh, shading) {
    let shadingType;
    shadingType = (shading === "smooth" ? THREE.SmoothShading : THREE.FlatShading);
    let material = new THREE.MeshPhongMaterial({
      color: 0x333333,
      shading: shadingType
    });
    mesh.material = material;
  },
  handleIntersection: function(object) {
    let {raycasterObj, objects, scene, mouse, camera} = object;

    raycasterObj.raycaster.setFromCamera(mouse, camera);
    let intersects = raycasterObj.raycaster.intersectObjects(scene.children);

    let tempIntersection;
    tempIntersection = (intersects[0] && intersects[0].object === objects.bigSphere) ? true : false;

    if (raycasterObj.intersection !== tempIntersection) {
      raycasterObj.intersection = tempIntersection;
      if (raycasterObj.intersection) {
        raycasterObj.intersected = intersects[0].object;
      }
      this.mouseToggle(raycasterObj);
    }
  },
  init: function (container, renderer) {
    let usefulThings = this.setup(container, renderer);
    this.animate(usefulThings);
  },
  mouseToggle: function(raycasterObj) {
    let {intersection, intersected} = raycasterObj;

    if (intersection) {
      document.body.style.cursor = "pointer";
      this.changeMaterial(intersected, "flat");
    } else {
      document.body.style.cursor = "initial";
      this.changeMaterial(intersected, "smooth");
    }
  },
  moveSmallSpheres: function(spheres) {
    for (let i = 0; i < spheres.length; i++) {
      let sphere = spheres[i];

      sphere.position.x += sphere.pace.x;
      sphere.position.y += sphere.pace.y;

      if (sphere.position.x > 400 || sphere.position.y > 300) {
        sphere.position.set(
          sphere.initialPosition[0],
          sphere.initialPosition[1],
          sphere.initialPosition[2]
        );
      }
    }
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
  prepCamera: function() {
    let camera;

    camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      400
    );
    camera.position.set(0, 0, 800);
    camera.lookAt(0,0,0);

    return camera;
  },
  prepScene: function() {
    let scene = new THREE.Scene();
    return scene;
  },
  prepRenderer: function (container, renderer) {
    renderer.setClearColor(0x222222);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    return renderer;
  },
  prepSmallSpheres: function(info, scene) {
    let spheres = [];
    for (let i = 0; i < info.count; i++) {
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry((Math.random() * 2), 8, 8),
        new THREE.MeshPhongMaterial({
          color: 0x333333,
          shading: THREE.SmoothShading
        })
      );

      const pos = [
        (Math.random() * 200) - 300,
        (Math.random() * 100) - 150,
        Math.random() * 200 + 575
      ];
      const xRate = (((1 - ((pos[2] - 675) * 0.01)) * Math.random() * 2) * 0.4);

      sphere.position.set(
        pos[0],
        pos[1],
        pos[2]
      );

      sphere.initialPosition = pos;

      sphere.pace = {
        x: xRate,
        y: xRate * 0.5
      }

      spheres.push(sphere);
      scene.add(sphere);
    }
    return spheres;
  },
  setup: function (container, renderer) {
    console.log('initialized b3!');

    let self = this;
    let mouse = new THREE.Vector2();
    const objects = new Object;
    let usefulThings = new Object;
    const objectsInfo = {
      bubbles: {count: 100, radius: 16}
    };
    const counters = new Object;
    const lightsObj = new Object;
    const raycasterObj = new Object;
    counters.a = 0;

    const scene = this.prepScene();
    const camera = this.prepCamera();
    renderer = this.prepRenderer(container, renderer);

    lightsObj.lights = [];

    raycasterObj.raycaster = new THREE.Raycaster();
    raycasterObj.intersection = false;

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
      color: 0x333333,
      shading: THREE.SmoothShading
    });
    const bigSphere = new THREE.Mesh(bigSphereGeom, material);
    bigSphere.geometry.verticesNeedUpdate = true;
    bigSphere.geometry.dynamic = true;
    bigSphere.position.set(0,0,675);
    scene.add(bigSphere);
    objects.bigSphere = bigSphere;
    objects.bigSphereMotion = [
      function(i) { return (Math.cos((counters.a * 4) - i) * 0.2) },
      function(i) { return (-(Math.cos((counters.a * 4) + i) * 0.2)) }
    ];

    objects.smallSpheres = this.prepSmallSpheres(objectsInfo.bubbles, scene);

    usefulThings = {
      camera,
      scene,
      renderer,
      mouse,
      objects,
      counters,
      lightsObj,
      raycasterObj
    };

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

    scene.updateMatrixWorld();

    counters.a += 0.02;


    this.handleIntersection({raycasterObj, objects, mouse, camera, scene});
    this.moveSmallSpheres(objects.smallSpheres);

    for (let i = 0; i < objects.bigSphere.geometry.vertices.length; i++) {
      let vertex = objects.bigSphere.geometry.vertices[i];

      vertex.set(
        vertex.x += objects.bigSphereMotion[0](i),
        vertex.y += objects.bigSphereMotion[0](i),
        vertex.z += objects.bigSphereMotion[0](i)
      );
    }

    objects.bigSphere.geometry.verticesNeedUpdate = true;
    objects.bigSphere.geometry.dynamic = true;

    // objects.bigSphere.rotation.x += 0.02;

    renderer.render(scene, camera);

    return {camera, scene, renderer, mouse, objects, counters, lightsObj, raycasterObj};
  }
};

module.exports = b3;
