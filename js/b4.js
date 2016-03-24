// b4.js

import THREE from 'three';
import bScene from './bScene.js';
import TweenLite from 'gsap';
import LinkedList from './utils/LinkedList'

const b4 = {
  init({container, renderer}) {
    console.log('initialized b4!')
    const b4Scene = bScene.create({container, renderer});

    b4Scene.incrementCounters = function () {
      this.counters.a += 0.02;
    }

    b4Scene.moveLights = function () {
      this.lights.lights.map(light => {
        let c = light.color
        let {h, s, l} = c.getHSL()
        let p = light.position
        let m = light.motion
        p.x += (Math.cos(this.counters.a) * m[0] * 1 )
        p.y += (Math.cos(this.counters.a) * m[1] * 1 )
        p.z += (Math.cos(this.counters.a) * m[2] * 1 )
        c.setHSL(((h + 0.001) % 0.4) + 0.4, s, l)
      })
    }

    b4Scene.prepCamera = function() {
      const camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        600
      );
      camera.position.set(100, 0, 15);
      camera.lookAt(0,0,0);

      this.camera = camera;
    }

    b4Scene.prepLights = function () {
      let i = 0;
      this.lights.lights = [
        [-100, 0, 0],
        [-500, 0, 200],
        [500, 0, -200],
        [0, 0, 0]
      ].map(coords => {
        const light = new THREE.PointLight(0x00ffff, 0.75, 500);
        light.position.set(coords[0], coords[1], coords[2]);
        light.motion = [Math.random(), Math.random(), Math.random()]
        light.color.setHSL((0.1 * i), 1, 0.5);
        i++
        this.scene.add(light);
        return light;
      })
      window.lights = this.lights.lights;
    }

    b4Scene.prepPlanes = function() {
      let info = this.objects.objInfo.planes;
      this.objects.planes = [];

      for (let i = 0; i < info.count; i++) {
        const rndPortion = 0.5
        let plane = new THREE.Mesh(
          new THREE.PlaneGeometry(info.size, info.size, 32),
          new THREE.MeshPhongMaterial({wireframe: true})
        )
        plane.position.set(0, (i - 5) * 100, 0);
        // plane.rotation.y -= 1.4;
        plane.wiggle = function(i) { return (Math.cos((this.counters.a * rndPortion) + i * 4) * 0.01)}.bind(this);
        plane.motion = function(i) { return (Math.cos((this.counters.a * rndPortion) + i * 1) * 0.1)}.bind(this)
        this.objects.planes.push(plane)
        this.scene.add(plane)
      }
      window.planes = this.objects.planes;
    }

    b4Scene.prepObjects = function () {
      let objs = new LinkedList();
      let {count, size} = this.objects.objInfo.tetras;

      for (var i = 0; i < count; i++) {
        let objSize = Math.random() * size;
        let mesh = new THREE.Mesh(
          new THREE.TetrahedronGeometry(objSize, 0),
          new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shading: THREE.FlatShading
          })
        );
        mesh.position.set(
          (Math.random() * 500) - 250,
          (Math.random() * 100) - 50,
          (Math.random() * 300) - 150
        );
        mesh.rotation.set(
          Math.random() * 3,
          Math.random() * 3,
          Math.random() * 3
        )
        mesh.geometry.verticesNeedUpdate = true;
        mesh.geometry.dynamic = true;
        window.meshW1 = 6;
        window.meshW2 = 0.02;
        window.meshM1 = 0.02;
        window.meshM2 = 1;
        window.meshM3 = 0.06;
        let val = Math.random()
        mesh.wiggle = function(i) { return (Math.cos((this.counters.a * Math.random() * window.meshW1) - i) * window.meshW2)}.bind(this);
        mesh.motion = function(i) { return ((Math.cos((this.counters.a * window.meshM1) - i) % window.meshM2) * val * window.meshM3)}.bind(this);

        this.scene.add(mesh);
        objs.add(mesh);
      }

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

    b4Scene.pulsateObjB = function(obj, dim, fn) {
      for (let i = 0; i < obj.geometry.vertices.length; i++) {
        let vertex = obj.geometry.vertices[i];

        vertex[dim] += obj[fn](i)
      }

      obj.geometry.verticesNeedUpdate = true;
      obj.geometry.dynamic = true;
    }

    b4Scene.pulsateObjC = function(obj, dim, fn, i) {
      let p = obj.position
      p[dim] += obj[fn](i)
    }

    b4Scene.moveTetras = function () {
      let i = 0;
      this.objects.objs.map(node => {
        this.pulsateObjA(node.value)
        this.pulsateObjC(node.value, 'z', 'motion', i)
        i++
      })
    }

    b4Scene.uniqueSetup = function () {
      this.objects.objInfo = {
        planes: {count: 15, size: 1000},
        tetras: {count: 75, size: 22}
      }

      this.prepCamera()
      this.prepControls()
      this.prepLights()
      this.prepObjects()
      this.prepPlanes()
      window.objects = this.objects

      this.renderer.setClearColor(0xf7f7f7)

      return (
        function() {
          this.incrementCounters()
          this.moveTetras()
          this.moveLights()

          for (let i = 0; i < this.objects.planes.length; i++) {
            const plane = this.objects.planes[i]
            this.pulsateObjB(plane, 'x', 'wiggle')
          }
        }.bind(this)
      )
    }

    b4Scene.init();

    return b4Scene;
  }
}

export default b4;
