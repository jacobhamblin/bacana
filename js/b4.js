// b4.js

import THREE from 'three';
import bScene from './bScene.js';
import TweenLite from 'gsap';

const b4 = {
  init({container, renderer}) {
    console.log('initialized b4!')
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

    b4Scene.prepPlanes = function() {
      this.objects.objInfo = {planes: {count: 10, size: 1000}}
      let info = this.objects.objInfo.planes
      this.objects.planes = []

      for (let i = 0; i < info.count; i++) {
        const rndPortion = 0.5
        let plane = new THREE.Mesh(
          new THREE.PlaneGeometry(info.size, info.size, 32),
          new THREE.MeshDepthMaterial({wireframe: true})
        )
        plane.position.set(0, (i - 5) * 100, 0)
        plane.rotation.x += 0.5
        plane.wiggle = function(i) { return (Math.cos((this.counters.a * rndPortion) + i * 4) * 0.02)}.bind(this);
        plane.motion = function(i) { return (Math.cos((this.counters.a * rndPortion) + i * 1) * 1)}.bind(this)
        this.objects.planes.push(plane)
        this.scene.add(plane)
      }
    }

    b4Scene.prepObjects = function () {
      let objs = [];

      let mesh = new THREE.Mesh(
        new THREE.TetrahedronGeometry(25, 0),
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
      mesh.wiggle = function(i) { return (Math.cos((this.counters.a * 6) - i) * 0.02)}.bind(this);

      this.scene.add(mesh);
      objs.push(mesh);

      this.objects.objs = objs;
    }

    b4Scene.pulsateObjA = function(obj) {
      for (let i = 0; i < obj.geometry.vertices.length; i++) {
        let vertex = obj.geometry.vertices[i];

        vertex.set(
          vertex.x += obj.wiggle(i),
          vertex.y += obj.wiggle(i),
          vertex.z += obj.wiggle(i)
        );
      }

      obj.geometry.verticesNeedUpdate = true;
      obj.geometry.dynamic = true;
    }

    b4Scene.pulsateObjB = function(obj) {
      for (let i = 0; i < obj.geometry.vertices.length; i++) {
        let vertex = obj.geometry.vertices[i];

        vertex.x += obj.wiggle(i)
      }

      obj.geometry.verticesNeedUpdate = true;
      obj.geometry.dynamic = true;
    }

    b4Scene.uniqueSetup = function () {
      this.objects.objInfo = {planeCount: 10, size: 100}

      this.prepLights()
      this.prepObjects()
      this.prepPlanes()
      window.objects = this.objects

      this.renderer.setClearColor(0xf7f7f7)

      return (
        function() {
          this.incrementCounters()
          this.pulsateObjA(this.objects.objs[0])
          for (let i = 0; i < this.objects.planes.length; i++) {
            const plane = this.objects.planes[i]
            this.pulsateObjB(plane)
            // plane.position.z += plane.motion(i)
          }
        }.bind(this)
      )
    }

    b4Scene.init();

    return b4Scene;
  }
}

export default b4;
