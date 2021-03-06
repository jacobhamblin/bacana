// b4.js

import THREE from 'three';
import bScene from './bScene.js';
import TweenLite from 'gsap';
import { LinkedList } from './utils'
import { OrbitControls, MeshLine } from './vendor';

const b4 = {
  init({container, renderer}) {
    console.log('initialized b4!')
    const b4Scene = bScene.create({container, renderer});

    b4Scene.changeMats = function(objs, planes, perception) {
      let wireframe = (perception ? true : false);
      let mat = (perception ? new THREE.MeshBasicMaterial(
        {wireframe: true, color: 0xAAAAAA}
      ) : new THREE.MeshPhongMaterial(
        {wireframe: true, emissive: 0x333333}
      ));

      objs.each(node => {
        node.value.material = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          shading: THREE.FlatShading,
          emissive: 0x333333,
          side: THREE.DoubleSide,
          wireframe: wireframe
        })
      })
      planes.forEach(plane => {
        plane.material = mat;
      })
      // objs['' + (perception + 1) % 2].each(node => {
      //   this.scene.remove(node.value)
      // })
      // objs['' + perception].each(node => {
      //   this.scene.add(node.value);
      // });
    }

    b4Scene.incrementCounters = function () {
      this.counters.a += 0.02;
    }

    b4Scene.moveLights = function () {
      let { a } = this.counters;
      this.lights.lights.map(light => {
        let c = light.color
        let {h, s, l} = c.getHSL()
        let p = light.position
        let m = light.motion
        p.x += (Math.cos(a) * m[0] * 1 )
        p.y += (Math.cos(a) * m[1] * 1 )
        p.z += (Math.cos(a) * m[2] * 1 )
        let op = h + 0.001;
        // s = (this.altPerception ? 0 : 0.8);
        let vals =[(((Math.sin((a * 0.1) + light.hue) * 0.2) + 0.8) % 1), s, l];

        c.setHSL(...vals);
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
        [-200, 0, 200],
        [200, 0, -200],
        [0, 0, 0]
      ].map(coords => {
        const light = new THREE.PointLight(0x00ffff, 0.75, 500);
        light.position.set(...coords);
        light.hue = (0.3 * i++) + 1
        light.motion = [Math.random(), Math.random(), Math.random()]
        light.color.setHSL(light.hue, 1, 0.5);
        this.scene.add(light);
        return light;
      })
      window.lights = this.lights.lights;
    }

    b4Scene.prepObjects = function() {
      let sphereGeom = new THREE.SphereGeometry(200,32,32)
			let material = new THREE.MeshBasicMaterial({
        color: 0x333333,
        side: THREE.BackSide
      });
      let sphere = new THREE.Mesh(sphereGeom, material)
      this.scene.add(sphere);

      this.prepTetras()
      this.prepPlanes()

    }

    b4Scene.prepPlanes = function() {
      let info = this.objects.objInfo.planes;
      this.objects.planes = [];

      for (let i = 0; i < info.count; i++) {
        const rndPortion = 0.5
        let plane = new THREE.Mesh(
          new THREE.PlaneGeometry(info.size, info.size, 32),
          new THREE.MeshPhongMaterial({wireframe: true, emissive: 0x333333})
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

    b4Scene.prepTetras = function () {
      let objs0 = new LinkedList();
      // let objs1 = new LinkedList();
      let {count, size} = this.objects.objInfo.tetras;
      for (var i = 0; i < count; i++) {
        let val = Math.random()
        let objSize = Math.random() * size;
        let position = [
          (Math.random() * 500) - 250,
          (Math.random() * 100) - 50,
          (Math.random() * 300) - 150
        ];
        let rotation = [
          Math.random() * 3,
          Math.random() * 3,
          Math.random() * 3
        ];
        let geom = new THREE.TetrahedronGeometry(objSize, 0);

        let mesh;

        mesh = new THREE.Mesh(
          geom,
          new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shading: THREE.FlatShading,
            emissive: 0x333333,
            side: THREE.DoubleSide
          })
        );
        mesh.position.set(...position);
        mesh.rotation.set(...rotation);
        mesh.geometry.verticesNeedUpdate = true;
        mesh.geometry.dynamic = true;
        window.meshW1 = 6;
        window.meshW2 = 0.02;
        window.meshM1 = 0.02;
        window.meshM2 = 1;
        window.meshM3 = 0.06;
        mesh.wiggle = function(i) { return (Math.cos((this.counters.a * Math.random() * window.meshW1) - i) * window.meshW2)}.bind(this);
        mesh.motion = function(i) { return ((Math.cos((this.counters.a * window.meshM1) - i) % window.meshM2) * val * window.meshM3)}.bind(this);
        objs0.add(mesh);
        this.scene.add(mesh);
      }

      // this.objects.objs = {0: objs0, 1: objs1};
      this.objects.objs = objs0;
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

    b4Scene.maybeShake = function() {
      let { shake, timestamp } = this.counters;
      let { interval } = shake;
      let now = new Date().getTime() / 1000;
      let timePassed = (now - timestamp);
      if (timePassed >= interval && this.altPerception === 0) {
        let durationAltPerception = Math.random() * 0.6;
        this.altPerception = 1;
        this.changeMats(this.objects.objs, this.objects.planes, this.altPerception);
        this.counters.timestamp += interval + durationAltPerception;
        this.counters.shake.interval = Math.random() * 5
      } else if ((now > timestamp) && this.altPerception === 1) {
        this.altPerception = 0;
        this.changeMats(this.objects.objs, this.objects.planes, this.altPerception);
      }

      if (this.altPerception) {
        let pos = this.camera.position;
        pos.x += Math.random() - 0.5,
        pos.y += Math.random() - 0.5,
        pos.z += Math.random() - 0.5
      }
    }

    b4Scene.checkVertices = function(obj) {
      // obj.updateMatrixWorld();
      //
      // let objP = [];
      // obj.geometry.vertices.forEach(vector => {
      //   let v = vector.clone();
      //   v.applyMatrix4(obj.matrixWorld);
      //   objP.push(v)
      // })
      // window.oPositions.push(objP)
    }

    b4Scene.moveTetras = function () {
      let i = 0, j = 0;
      window.oPositions = [];
      this.objects.objs.each(node => {
        // this.pulsateObjA(node.value)
        this.checkVertices(node.value)
        this.pulsateObjC(node.value, 'z', 'motion', i)
        i++
      });
      // this.objects.objs['1'].each(node => {
      //   this.checkVertices(node.value);
      //   this.pulsateObjC(node.value, 'z', 'motion', i);
      //   j++
      // })
    }

    b4Scene.prepControls = function() {
      this.controls = new OrbitControls(
        this.camera, this.renderer.domElement
      );
      this.controls.rotateSpeed = 1;
      this.controls.enablePan = false;
      this.controls.maxDistance = 199;
    }

    b4Scene.uniqueSetup = function () {
      this.objects.objInfo = {
        planes: {count: 15, size: 1000},
        tetras: {count: 125, size: 22}
      }
      this.colors = [
      	0xed6a5a, 0xf4f1bb, 0x9bc1bc,	0x5ca4a9,
      	0xe6ebe0,	0xf0b67f,	0xfe5f55, 0xd6d1b1,
        0xc7efcf, 0xeef5db,	0x50514f,	0xf25f5c,
      	0xffe066,	0x247ba0,	0x70c1b3
      ];
      this.counters.timestamp = new Date().getTime() / 1000;
      this.counters.shake = {
        interval: Math.random() * 5
      };
      this.altPerception = 0;
      this.controls.enableZoom = false;

      this.prepCamera()
      this.prepControls()
      this.prepLights()
      this.prepObjects()
      this.watchWindowFocus()

      this.renderer.setClearColor(0xf7f7f7)

      return (
        function() {
          this.incrementCounters()
          this.moveTetras()
          this.moveLights()
          this.maybeShake()

          for (let i = 0; i < this.objects.planes.length; i++) {
            const plane = this.objects.planes[i]
            this.pulsateObjB(plane, 'x', 'wiggle')
          }
        }.bind(this)
      )
    }

    b4Scene.watchWindowFocus = function() {
      document.addEventListener('visibilitychange', (e) => {
        if (!document.hidden) this.counters.timestamp = new Date().getTime() / 1000;
      })
    }

    b4Scene.init();

    return b4Scene;
  }
}

export default b4;
