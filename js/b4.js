// b4.js

import THREE from 'three';
import bScene from './bScene.js';

const b4 = {
  init({container, renderer}) {
    console.log('b4 initialized!')
    console.log(bScene);
    const b4Scene = bScene.create({container, renderer});

    b4Scene.incrementCounters = function () {
      this.counters.a += 0.02;
    }

    b4Scene.prepLights = function () {
      const light = new THREE.PointLight(0x00ffff, 0.5, 1000);
      light.position.set(0,0,200);
      this.scene.add(light);

      this.lights.lights = [light];
    }

    b4Scene.prepObjects = function () {
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
        mesh.motion = function(i) { return Math.tan((this.counters.a) + i * 0.02) }.bind(this);

        this.scene.add(mesh);
        objs.push(mesh);

      this.objects.objs = objs;
    }

    b4Scene.pulsateBigSphere = function(objs) {
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
    }

    b4Scene.uniqueSetup = function () {
      this.prepLights()
      this.prepObjects()

      return (
        function() {
          this.incrementCounters()

          this.pulsateBigSphere(this.objects.objs)
        }.bind(this)
      )
    }

    b4Scene.init();
  }
}

export default b4;
