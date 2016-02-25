// b1.js

import THREE from 'three';
import TessellateModifier from './vendor/TessellateModifier.js';
import ExplodeModifier from './vendor/ExplodeModifier.js';
import FragmentShader from './vendor/shaders/fragment.txt';
import VertexShader from './vendor/shaders/vertex.txt';
import FresnelShader from './vendor/shaders/FresnelShader.js';
import OrbitControls from './vendor/OrbitControls.js';

const b1 = {
  usefulThings: null,
  animate: function(usefulThings) {
    let self = this;

    let newThings = this.render(usefulThings);

    if (document.querySelectorAll('canvas')[0]) {
      requestAnimationFrame(function() {self.animate(newThings)});
    }
  },
  changeParticleColors: function({objects, raycasterObj, counters, altTime}) {
    for (let i = 0; i < objects.materials.length; i++) {
      let mats = objects.materials;
      let material = objects.materials[i];

      let params = objects.particlesParameters;
      let grayscale = [params[i][0][0], 0, params[i][0][2]];
      let timePassed = ((Date.now() * 0.001) - counters.lastHovered) - (((mats.length - 1) - i) * 0.4);
      timePassed > 2 ? timePassed = 2 : null;
      timePassed < 0 ? timePassed = 0 : null;
      let modifier = timePassed / 2;

      let coloring = [
        params[i][0][0],
        modifier * params[i][0][1],
        params[i][0][2]
      ];
      let color = ( raycasterObj.intersection ? coloring : grayscale);

      let h = ( 360 * ( color[0] + altTime ) % 360 ) / 360;
			material.color.setHSL( h, color[1], color[2] );
    }
  },
  endDemo: function(usefulThings) {
    let {renderer, scene, camera} = usefulThings;

    renderer.domElement.addEventListener('dblclick', null, false);
    scene = null;
    camera = null;
  },
  handleIntersection: function(object) {
    let {raycasterObj, objects, scene, mouse, camera, counters, altTime} = object;

    raycasterObj.raycaster.setFromCamera(mouse, camera);
    let intersects = raycasterObj.raycaster.intersectObjects(scene.children);

    let tempIntersection;
    tempIntersection = (intersects[0] && intersects[0].object === objects.obj1[0]) ? true : false;

    if (raycasterObj.intersection !== tempIntersection) {
      raycasterObj.intersection = tempIntersection;
      if (tempIntersection) {
        document.body.style.cursor = "pointer";
        counters.lastHovered = (Date.now() * 0.001);
      } else {
        document.body.style.cursor = "initial";
      }
    }
  },
  init: function ({container, renderer}) {
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
  prepControls: function({camera, renderer}) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.rotateSpeed = 1;
    controls.enablePan = false;
    return controls;
  },
  prepCamera: function () {
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      400
    );
    camera.position.set(0, 0, 50);
    camera.lookAt(0,0,0);

    return camera;
  },
  prepParticles: function({scene, objects}) {
    const geometry = new THREE.Geometry();

    for ( let i = 0; i < 10000; i++ ) {
      let vertex = new THREE.Vector3();
      vertex.x = Math.random() * 1500 - 750;
      vertex.y = Math.random() * 1500 - 750;
      vertex.z = Math.random() * 1500 - 750;
      geometry.vertices.push(vertex);
    }

    let particlesArr = [], materials = [];

    for ( let i = 0; i < objects.particlesParameters.length; i++ ) {
      let color = objects.particlesParameters[i][0];
      let size  = objects.particlesParameters[i][1];

      materials[i] = new THREE.PointsMaterial({ size: size });
      const particles = new THREE.Points( geometry, materials[i] );
      particles.rotation.x = Math.random() * 30;
      particles.rotation.y = Math.random() * 30;
      particles.rotation.z = Math.random() * 30;

      particlesArr.push(particles);
      scene.add( particles );

    }
    return {particles: particlesArr, materials};
  },
  prepRenderer: function({container, renderer}) {
    renderer.setClearColor(0x222222);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    return renderer;
  },
  prepScene: function () {
    const scene = new THREE.Scene();

    return scene;
  },
  render: function(usefulThings) {
    let {
      objects,
      camera,
      counters,
      renderer,
      scene,
      mouse,
      uniforms,
      controls,
      raycasterObj
    } = usefulThings;

    controls.update();

    let time = Date.now() * 0.001;
    let altTime = Date.now() * 0.000025;

    this.handleIntersection({raycasterObj, objects, scene, mouse, camera, counters, altTime});

    for (let i = 0; i < objects.obj1.length; i++) {
      objects.obj1[i].rotation.x += 0.05;
      uniforms[i].amplitude.value = 1.0 + Math.cos(time * 1.25);
    }
    for (let i = 0; i < objects.particles1.length; i++) {
      let particle = objects.particles1[i];
      particle.rotation.x = altTime * (i < 4 ? i + 1 : -(i + 1))
    }

    this.changeParticleColors({objects, raycasterObj, counters, altTime});

    counters.a += 0.02;

    renderer.render(scene, camera);

    return {controls, camera, scene, renderer, mouse, objects, counters, uniforms, raycasterObj};
  },
  setup: function ({container, renderer}) {
    console.log('initialized b1!');

    let mouse = new THREE.Vector2();
    const objects = new Object;
    let usefulThings = new Object, raycasterObj = new Object;
    let uniforms = [];
    let parameters = [];
    let objectsInfo = {count: 1, radius: 15};
    const counters = new Object;
    counters.a = 0;

    const camera = this.prepCamera();
    const scene = this.prepScene();
    renderer = this.prepRenderer({container, renderer});

    raycasterObj.raycaster = new THREE.Raycaster();
    raycasterObj.intersection = false;

    const controls = this.prepControls({camera, renderer});

    const light = new THREE.PointLight(0xffffff, 1, 2000);

    light.position.set(0, 0, 900);

    scene.add(light);

    objects.obj1 = [];

    objects.particlesParameters = [
      [ [0.80, 1, 0.5], 1.25 ],
      [ [0.75, 1, 0.5], 1 ],
      [ [0.70, 1, 0.5], 0.75 ],
      [ [0.65, 1, 0.5], 0.5 ],
      [ [0.60, 1, 0.5], 0.25 ]
    ];

    let particleParams = objects.particlesParameters;
    let particlesObject = this.prepParticles({scene, objects});
    objects.particles1 = particlesObject.particles;
    objects.materials = particlesObject.materials;

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

        let h = 0.5 + ((i - 1) * .1) * Math.random();
        let s = 0;
        let l = 0.05 + 0.05 * Math.random();

        color.setHSL( h, s, l );

        let d = 10 * ( 0.5 - Math.random() );

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
        shading: THREE.FlatShading,
        fragmentShader: FragmentShader,
        vertexShader: VertexShader,
        uniforms: uniforms[i],
        side: THREE.DoubleSide
			});

      const object = new THREE.Mesh(newGeometry, shaderMaterial);

      object.position.set(
        0,
        0,
        0
      );

      objects.obj1.push(object);
      scene.add(object);
    }

    usefulThings = {controls, camera, scene, renderer, mouse, objects, counters, uniforms, raycasterObj};

    this.usefulThings = usefulThings;

    let self = this;
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

    return usefulThings;
  }
};

module.exports = b1;
