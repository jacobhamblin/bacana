// b1.js

import THREE from 'three';
import TessellateModifier from './vendor/TessellateModifier.js';
import ExplodeModifier from './vendor/ExplodeModifier.js';
import FragmentShader from './vendor/shaders/fragment.txt';
import VertexShader from './vendor/shaders/vertex.txt';

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
    let uniforms = [];
    let objectsInfo = {count: 7, radius: 15};
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

    objects.obj1 = [];

    for (let i = 0; i < objectsInfo.count; i++) {

      const geometry = new THREE.IcosahedronGeometry(objectsInfo.radius);

      const maxLength = (i % 2 === 0 ? 16 : 4);
      const tessellateModifier = new TessellateModifier(maxLength);

      for (let j = 0; j < 6; j++) {
        tessellateModifier.modify(geometry);
      }

      const explodeModifier = new ExplodeModifier();
      explodeModifier.modify(geometry);

      const numFaces = geometry.faces.length;

      const newGeometry = new THREE.BufferGeometry().fromGeometry(geometry);

      // const material = new THREE.MeshPhongMaterial({
      //   color: 0xbbbbbb,
      //   shading: THREE.FlatShading
      // });


      const colors = new Float32Array( numFaces * 3 * 3 );
      const displacement = new Float32Array( numFaces * 3 * 3 );

      let color = new THREE.Color();

      for ( let f = 0; f < numFaces; f ++ ) {
        let index = 9 * f;

        let h = 0.5 + ((i - 3) * .1) * Math.random();
        let s = 0.5 + 0.2 * Math.random();
        let l = 0.5 + 0.3 * Math.random();

        color.setHSL( h, s, l );

        var d = 10 * ( 0.5 - Math.random() );

        for ( var k = 0; k < 3; k ++ ) {

          colors[index + (3 * k)    ] = color.r;
          colors[index + (3 * k) + 1] = color.g;
          colors[index + (3 * k) + 2] = color.b;

          displacement[index + (3 * k)    ] = d;
          displacement[index + (3 * k) + 1] = d;
          displacement[index + (3 * k) + 2] = d;
        }
      }

      newGeometry.addAttribute(
        'customColor',
        new THREE.BufferAttribute(colors, 3)
      );
      newGeometry.addAttribute('displacement',
        new THREE.BufferAttribute(displacement, 3)
      );

      uniforms.push({
				amplitude: { type: "f", value: 0.0 }
			});

			const shaderMaterial = new THREE.ShaderMaterial( {
				uniforms:       uniforms[i],
				vertexShader:   VertexShader,
				fragmentShader: FragmentShader
			});

      const object = new THREE.Mesh(newGeometry, shaderMaterial);

      object.position.set(
        Math.random() * 150 - 75,
        Math.random() * 150 - 75,
        Math.random() * 300 + 450
      );

      objects.obj1.push(object);
      scene.add(object);
    }


    usefulThings = {camera: camera, scene: scene, renderer: renderer, mouse: mouse, objects: objects, counters: counters, uniforms: uniforms};

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
      uniforms
    } = usefulThings;
    let time = Date.now() * 0.001;

    for (let i = 0; i < objects.obj1.length; i++) {
      objects.obj1[i].rotation.y += (Math.cos(counters.a) * .025);
      uniforms[i].amplitude.value = 1.0 + Math.cos(time * 0.5);
    }

    counters.a += 0.02;

    renderer.render(scene, camera);

    return {camera: camera, scene: scene, renderer: renderer, mouse: mouse, objects: objects, counters: counters, uniforms: uniforms};
  }
};

module.exports = b1;
