// b2.js

import THREE from 'three';
import bScene from './bScene.js';
import OBJLoader from './vendor/OBJLoader.js';

const b2 = {
  init: function ({container, renderer}) {
    console.log('initialized b2!')
    const b2Scene = bScene.create({container, renderer});

    b2Scene.applyMaterial = function(object, color) {
      let material = new THREE.MeshPhongMaterial({
        shading: THREE.FlatShading,
        color: color
      });

      object.material = material;
      return object;
    }

    b2Scene.crystalClicked = function () {
      this.counters.clicked = this.counters.frame;
      // render method calls switchActiveCrystal when seven frames have passed
    }

    b2Scene.handleRaycasterIntersection = function () {
      this.raycaster.raycaster.setFromCamera(this.mouse, this.camera);
      let intersects = this.raycaster.raycaster.intersectObjects(this.scene.children);

      let tempIntersection = false;
      if (intersects.length > 0) {
        for (let i = 0; i < this.objects.crystals.length; i++) {
          if (this.objects.crystals[i] === intersects[0].object) {
            tempIntersection = true;
          }
        }
        this.raycaster.intersection = tempIntersection;
        if (this.raycaster.intersection === false) {
          this.mouseleaveCrystal();
        } else {
          this.mouseenterCrystal();
        }
      } else {
        this.raycaster.intersection = tempIntersection;
        if (this.raycaster.intersection === false) {
          this.mouseleaveCrystal();
        }
      }

      if (this.raycaster.intersection) {
        let val = this.counters.frame % 2 === 0 ? (Math.cos(this.counters.cosY) * 2) : -(Math.cos(this.counters.cosY) * 2);
        this.objects.crystals[this.objects.activeCrystal].position.x += val;
      }
    }

    b2Scene.mouseenterCrystal = function() {
      document.body.style.cursor = "pointer";
    }

    b2Scene.mouseleaveCrystal = function () {
      if (
        this.objects.crystals[this.objects.activeCrystal] &&
        this.raycaster.intersection === false
      ) {
        this.objects.crystals[this.objects.activeCrystal].position.x = 0;
        document.body.style.cursor = "initial";
      }
    }

    b2Scene.onMouseClick = function() {
      if (this.raycaster && this.raycaster.intersection) {
        this.crystalClicked();
      }
    }

    b2Scene.prepCamera = function() {
      const camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        400
      );
      camera.position.set(0, 0, 800);
      camera.lookAt(0,0,0);

      this.camera = camera;
    }

    b2Scene.prepCrystals = function() {
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


      self.objects.crystals = [];

      const icosahedronGeom = new THREE.IcosahedronGeometry(250, 3);
      const icosahedronMat = new THREE.MeshDepthMaterial({
        wireframe: true
      });
      let icosahedron = new THREE.Mesh(icosahedronGeom, icosahedronMat);
      icosahedron.position.set(0,0,700);
      this.scene.add(icosahedron);
      this.objects.icosahedron = icosahedron;

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
              self.objects.crystals.push(child);
              loadedCount++;
            }
          });

          if (loadedCount === crystalObjects.length) {
            self.objects.activeCrystal = 0;
            self.scene.add(self.objects.crystals[self.objects.activeCrystal]);
          }
        }, onProgress, onError);
      }
    }

    b2Scene.prepLights = function() {
      const primLight = new THREE.PointLight(0xffffff, 1, 2000);
      primLight.position.set(0, 0, 900);
      this.scene.add(primLight);

      const lightParameters = [
        [0xff0000, 0.5, [-100, 0, 900]],
        [0x7700FF, 0.5, [100, 0, 900]],
      ]

      this.lights.colors = [
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
        this.scene.add(light);
      }

      this.lights.lights = lights;
    }

    b2Scene.pulsateLights = function () {
      for (let i = 0; i < this.lights.lights.length; i++) {
        let intensities = Math.abs(Math.cos((this.counters.cosY * 10) + i));
        let calculation = (1 - Math.abs(this.mouse.x));
        let intensity = (calculation > 0.3 ? ((calculation - 0.3) * 2) : 0);
        this.lights.lights[i].intensity = (intensities * (intensity));
      }
    }

    b2Scene.rollIcosahedron = function () {
      this.objects.icosahedron.rotation.y += (this.mouse.x * 0.004);
      this.objects.icosahedron.rotation.x += (this.mouse.y * 0.004);
    }

    b2Scene.uniqueSetup = function () {
      this.counters.cosY = 0;
      this.counters.frame = 0;
      this.counters.floatingCrystalPos = 0;
      this.counters.clicked = -4;
      this.prepCamera()
      this.prepLights()
      this.prepCrystals()
      this.controls = null;

      let self = this;
      document.querySelector('canvas').addEventListener(
        'click',
        function() {self.onMouseClick()},
        false
      )

      return (
        function() {
          this.counters.floatingCrystalPos += (Math.cos(this.counters.cosY) * 0.2);
          this.counters.cosY += 0.02;

          this.shakeOrSwapCrystal()
          this.pulsateLights()
          this.handleRaycasterIntersection()
          this.rollIcosahedron()

          this.counters.frame++;
        }
      ).bind(this)
    }

    b2Scene.shakeOrSwapCrystal = function () {
      if (typeof this.objects.activeCrystal === typeof 1) {
        this.objects.crystals[this.objects.activeCrystal].rotation.y += 0.05;
        this.objects.crystals[this.objects.activeCrystal].position.y = this.counters.floatingCrystalPos;
        if (
          (this.counters.frame <= this.counters.clicked + 7) &&
          (this.counters.frame > this.counters.clicked)
        ) {
          switch(Math.floor(Math.random() * 3)) {
            case 0:
            this.renderer.setClearColor(0x222222);
            break;
            case 1:
            this.renderer.setClearColor(this.lights.colors[this.objects.activeCrystal][0]);
            break;
            case 2:
            this.renderer.setClearColor(this.lights.colors[this.objects.activeCrystal][1]);
            break;
          }
          this.objects.crystals[this.objects.activeCrystal]
          .position.x += (Math.random() * 10) - 5;
          this.objects.crystals[this.objects.activeCrystal]
          .position.y += (Math.random() * 10) - 5;
        } else if (this.counters.frame === (this.counters.clicked + 8)) {
          this.switchActiveCrystal();
          renderer.setClearColor(0x222222)
        }
      }
    }

    b2Scene.switchActiveCrystal = function() {
      this.objects.crystals[this.objects.activeCrystal].position.x = 0;
      this.scene.remove(this.objects.crystals[this.objects.activeCrystal]);
      this.objects.activeCrystal = (this.objects.activeCrystal + 1) % this.objects.crystals.length;
      this.scene.add(this.objects.crystals[this.objects.activeCrystal]);

      for (let i = 0; i < this.lights.lights.length; i++) {
        this.lights.lights[i].color = new THREE.Color(this.lights.colors[this.objects.activeCrystal][i]);
      }
    }

    b2Scene.init();

    return b2Scene;
  }
};

export default b2
