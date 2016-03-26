// b1.js

import THREE from 'three';
import { ExplodeModifier, TessellateModifier, OrbitControls } from './vendor';
import { FragmentShader, VertexShader } from './vendor/shaders';
import bScene from './bScene.js';

const b1 = {
  init: function ({container, renderer}) {
    console.log('initialized b1!')
    const b1Scene = bScene.create({container, renderer});

    b1Scene.changeParticleColors = function () {
      for (let i = 0; i < this.objects.materials.length; i++) {
        let mats = this.objects.materials;
        let material = this.objects.materials[i];

        let params = this.objects.particlesParameters;
        let grayscale = [params[i][0][0], 0, params[i][0][2]];
        let timePassed = ((Date.now() * 0.001) - this.counters.lastHovered) - (((mats.length - 1) - i) * 0.1);
        timePassed > 2 ? timePassed = 2 : null;
        timePassed < 0 ? timePassed = 0 : null;
        let modifier = timePassed / 2;

        let coloring = [
          params[i][0][0],
          modifier * params[i][0][1],
          params[i][0][2]
        ];
        let color = ( this.raycaster.intersection ? coloring : grayscale);

        let h = ( 360 * ( color[0] + this.counters.altTime ) % 360 ) / 360;
        material.color.setHSL( h, color[1], color[2] );
      }
    }

    b1Scene.handleIntersection = function () {
      this.raycaster.raycaster.setFromCamera(this.mouse, this.camera);
      let intersects = this.raycaster.raycaster.intersectObjects(this.scene.children);

      let tempIntersection;
      tempIntersection = (intersects[0] && intersects[0].object === this.objects.obj1[0]) ? true : false;

      if (this.raycaster.intersection !== tempIntersection) {
        this.raycaster.intersection = tempIntersection;
        if (tempIntersection) {
          document.body.style.cursor = "pointer";
          this.counters.lastHovered = (Date.now() * 0.001);
        } else {
          document.body.style.cursor = "initial";
        }
      }
    }

    b1Scene.incrementCounters = function () {
      this.counters.time = Date.now() * 0.001;
      this.counters.altTime = Date.now() * 0.000025;
      this.counters.a += 0.02;
    }

    b1Scene.prepCamera = function () {
      const camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        400
      );
      camera.position.set(0, 0, 50);
      camera.lookAt(0,0,0);

      this.camera = camera;
    }

    b1Scene.prepIcosahedron = function () {
      for (let i = 0; i < this.objects.info.count; i++) {
        const geometry = new THREE.IcosahedronGeometry(this.objects.info.radius);
        const maxLength = (i % 2 === 0 ? 16 : 4);
        const tessellateModifier = new TessellateModifier(maxLength);

        for (let j = 0; j < 6; j++) {
          tessellateModifier.modify(geometry);
        }

        const explodeModifier = new ExplodeModifier();
        explodeModifier.modify(geometry);
        const numFaces = geometry.faces.length;
        const newGeometry = new THREE.BufferGeometry().fromGeometry(geometry);
        const colors = new Float32Array( numFaces * 3 * 3 );
        const displacement = new Float32Array( numFaces * 3 * 3 );
        let color = new THREE.Color();
        for ( let f = 0; f < numFaces; f ++ ) {
          let index = 9 * f;

          let h = 0.5 + ((i - 1) * 0.1) * Math.random();
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

        this.uniforms.push({
  				amplitude: { type: "f", value: 0.0 }
  			});

  			const shaderMaterial = new THREE.ShaderMaterial( {
          shading: THREE.FlatShading,
          fragmentShader: FragmentShader,
          vertexShader: VertexShader,
          uniforms: this.uniforms[i],
          side: THREE.DoubleSide
  			});

        const object = new THREE.Mesh(newGeometry, shaderMaterial);

        object.position.set(
          0,
          0,
          0
        );

        this.objects.obj1.push(object);
        this.scene.add(object);
      }
    }

    b1Scene.prepLights = function () {
      this.lights.lights = [];
      const light = new THREE.PointLight(0xffffff, 1, 2000);
      light.position.set(0, 0, 900);
      this.lights.lights.push(light)
      this.scene.add(light);
    }

    b1Scene.prepParticles = function () {
      const geometry = new THREE.Geometry();

      for ( let i = 0; i < 10000; i++ ) {
        let vertex = new THREE.Vector3();
        vertex.x = Math.random() * 1500 - 750;
        vertex.y = Math.random() * 1500 - 750;
        vertex.z = Math.random() * 1500 - 750;
        geometry.vertices.push(vertex);
      }

      let particlesArr = [], materials = [];

      for ( let i = 0; i < this.objects.particlesParameters.length; i++ ) {
        let color = this.objects.particlesParameters[i][0];
        let size  = this.objects.particlesParameters[i][1];

        materials[i] = new THREE.PointsMaterial({ size: size });
        const particles = new THREE.Points( geometry, materials[i] );
        particles.rotation.x = Math.random() * 30;
        particles.rotation.y = Math.random() * 30;
        particles.rotation.z = Math.random() * 30;

        particlesArr.push(particles);
        this.scene.add( particles );

      }

      this.objects.particles1 = particlesArr;
      this.objects.materials = materials;
    }

    b1Scene.rotateIcosahedron = function () {
      for (let i = 0; i < this.objects.obj1.length; i++) {
        this.objects.obj1[i].rotation.x += 0.05;
        this.uniforms[i].amplitude.value = 1.0 + Math.cos(this.counters.time * 1.25);
      }
    }

    b1Scene.rotateParticles = function () {
      for (let i = 0; i < this.objects.particles1.length; i++) {
        let particle = this.objects.particles1[i];
        particle.rotation.x = this.counters.altTime * (i < 4 ? i + 1 : -(i + 1))
      }
    }

    b1Scene.uniqueSetup = function () {
      this.prepCamera()
      this.prepControls()
      this.prepLights()

      this.counters.time = Date.now() * 0.001;
      this.counters.altTime = Date.now() * 0.000025;
      this.objects.info = {count: 1, radius: 15};
      this.uniforms = [];
      this.objects.obj1 = [];

      this.objects.particlesParameters = [
        [ [0.80, 1, 0.5], 1.25 ],
        [ [0.75, 1, 0.5], 1 ],
        [ [0.70, 1, 0.5], 0.75 ],
        [ [0.65, 1, 0.5], 0.5 ],
        [ [0.60, 1, 0.5], 0.25 ]
      ];

      this.prepParticles()
      this.prepIcosahedron()

      return (
        function () {
          this.incrementCounters()
          this.handleIntersection()
          this.changeParticleColors()
          this.rotateIcosahedron()
          this.rotateParticles()
        }.bind(this)
      )
    }

    b1Scene.init()

    return b1Scene
  }
};

export default b1
