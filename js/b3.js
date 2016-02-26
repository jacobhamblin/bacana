// b3.js

import THREE from 'three';
import bScene from './bScene.js';
import OrbitControls from './vendor/OrbitControls.js';

const b3 = {
  init: function ({container, renderer}) {
    console.log('initialized b3!')
    const b3Scene = bScene.create({container, renderer});

    b3Scene.changeMaterial = function(mesh, shading) {
      let shadingType;
      shadingType = (shading === "smooth" ? THREE.SmoothShading : THREE.FlatShading);
      let material = new THREE.MeshPhongMaterial({
        color: 0x333333,
        shading: shadingType
      });
      mesh.material = material;
    }

    b3Scene.handleIntersection = function () {
      this.raycaster.raycaster.setFromCamera(this.mouse, this.camera);
      let intersects = this.raycaster.raycaster.intersectObjects(this.scene.children);

      let tempIntersection;
      tempIntersection = (intersects[0] && intersects[0].object === this.objects.bigSphere) ? true : false;

      if (this.raycaster.intersection !== tempIntersection) {
        this.raycaster.intersection = tempIntersection;
        if (this.raycaster.intersection) {
          this.raycaster.intersected = intersects[0].object;
        }
        this.mouseToggle();
      }
    }

    b3Scene.incrementCounters = function () {
      this.counters.a += 0.02
    }

    b3Scene.mouseToggle = function () {
      if (this.raycaster.intersection) {
        document.body.style.cursor = "pointer";
        this.changeMaterial(this.raycaster.intersected, "flat");
      } else {
        document.body.style.cursor = "initial";
        this.changeMaterial(this.objects.bigSphere, "smooth");
      }
    }

    b3Scene.moveSmallSpheres = function(spheres) {
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
    }

    b3Scene.prepBigSphere = function () {
      const self = this;
      const bigSphereGeom = new THREE.SphereGeometry(50, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: 0x333333,
        shading: THREE.SmoothShading
      });
      const bigSphere = new THREE.Mesh(bigSphereGeom, material);
      bigSphere.geometry.verticesNeedUpdate = true;
      bigSphere.geometry.dynamic = true;
      bigSphere.position.set(0,0,0);
      bigSphere.motion = [
        function(i) { return (Math.cos((self.counters.a * 4) - i) * 0.2) },
        function(i) { return (-(Math.cos((self.counters.a * 4) + i) * 0.2)) }
      ];
      bigSphere.rotation.y += 0.5;
      this.scene.add(bigSphere);

      this.objects.bigSphere = bigSphere;
    }

    b3Scene.prepCamera = function () {
      let camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        400
      );
      camera.position.set(0, 0, 125);
      camera.lookAt(0,0,0);

      this.camera = camera;
    }

    b3Scene.prepControls = function() {
      const controls = new OrbitControls(this.camera, this.renderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.rotateSpeed = 1;
      this.controls = controls;
    }

    b3Scene.prepLights = function () {
      const lightOne = new THREE.PointLight(0xffffff, 1, 2000);
      lightOne.position.set(0, 0, -75);
      this.scene.add(lightOne);

      const lightTwo = new THREE.PointLight(0xffffff, 1, 2000);
      lightTwo.position.set(-100,-100,225);
      this.scene.add(lightTwo);

      this.lights.lights = [lightOne, lightTwo];
    }

    b3Scene.prepSmallSpheres = function () {
      let spheres = [];
      for (let i = 0; i < this.objects.info.bubbles.count; i++) {
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
          Math.random() * 200 - 100
        ];
        const xRate = (((1 - ((pos[2] - 100) * 0.01)) * Math.random() * 2) * 0.4);

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
        this.scene.add(sphere);
      }
      this.objects.smallSpheres = spheres;
    }

    b3Scene.pulsateObj = function(obj) {
      for (let i = 0; i < obj.geometry.vertices.length; i++) {
        let vertex = obj.geometry.vertices[i];

        vertex.set(
          vertex.x += obj.motion[0](i),
          vertex.y += obj.motion[0](i),
          vertex.z += obj.motion[0](i)
        );
      }

      obj.geometry.verticesNeedUpdate = true;
      obj.geometry.dynamic = true;
    }

    b3Scene.uniqueSetup = function () {
      this.objects.info = {
        bubbles: {count: 100, radius: 16}
      };
      this.prepCamera()
      this.prepControls()
      this.prepLights()
      this.prepSmallSpheres()
      this.prepBigSphere()


      return (
        function () {
          this.incrementCounters()

          this.pulsateObj(this.objects.bigSphere)
          this.handleIntersection()
          this.moveSmallSpheres(this.objects.smallSpheres)
        }.bind(this)
      )
    }

    b3Scene.init()

    return b3Scene
  }
};

module.exports = b3;
