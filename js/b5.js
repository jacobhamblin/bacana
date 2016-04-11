// b5.js

import THREE from 'three';
import bScene from './bScene.js';
import TweenLite from 'gsap';
import { LinkedList } from './utils'
import { MeshLine, MeshLineMaterial } from './vendor';

const b5 = {
  init({container, renderer}) {
    console.log('initialized b5!')
    const b5Scene = bScene.create({container, renderer});

    b5Scene.createCrystal = function() {
      let { currentCrystal } = this.counters
      let { x, y, z } = this.raycaster.pos

      let crystal = this.objects.crystalObjs[currentCrystal].clone()
      crystal.position.set(x, y, z)
      this.scene.add(crystal)
      this.objects.crystals.push(crystal)

      this.counters.currentCrystal = (currentCrystal + 1) % 3
      console.log(this.counters.currentCrystal)
    }

    b5Scene.incrementCounters = function() {
      this.counters.a += 0.02;
    }

    b5Scene.handleRaycasterIntersection = function() {
      this.raycaster.raycaster.setFromCamera(this.mouse, this.camera)
      let intersects = this.raycaster.raycaster.intersectObjects(this.scene.children)

      if (intersects.length > 0 && intersects[0].object === this.objects.plane) {
        this.raycaster.intersected = this.objects.plane
        this.raycaster.pos = intersects[0].point
      } else {
        this.raycaster.intersected = null
      }
    }

    b5Scene.maybeCreateCrystal = function() {
      if (this.raycaster.intersected === this.objects.plane) {
        this.createCrystal()
      }
    }

    b5Scene.prepObjects = function () {
      this.prepPlane();
      this.objects.crystalObjs = []

      let colors = [
      	0xed6a5a, 0xf4f1bb, 0x9bc1bc,	0x5ca4a9,
      	0xe6ebe0,	0xf0b67f,	0xfe5f55, 0xd6d1b1,
        0xc7efcf, 0xeef5db,	0x50514f,	0xf25f5c,
      	0xffe066,	0x247ba0,	0x70c1b3
      ];
      window.THREE = THREE;
      let resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );
      let material = new THREE.MeshLineMaterial( {
      	map: THREE.ImageUtils.loadTexture( '../img/stroke.png' ),
      	useMap: false,
      	color: new THREE.Color( colors[ 3 ] ),
      	opacity: 0.5,
      	resolution: resolution,
      	sizeAttenuation: false,
      	lineWidth: 10,
      	near: this.camera.near,
      	far: this.camera.far,
      	depthWrite: false,
      	depthTest: false,
      	transparent: true
      });
      this.materials.meshLine = material
    }

    function collectPoints( sources ) {
      for (var h = 0; h < sources.length; h++) {
        let source = sources[h]
        var g = source.children[ 0 ].geometry;
        g.center()
        var scaleMatrix = new THREE.Matrix4();
        scaleMatrix.makeScale( 1, 1, 1 );
        g.applyMatrix( scaleMatrix );

        var o = new THREE.Mesh( g, new THREE.MeshNormalMaterial() );
        //this.scene.add( o );

        var raycaster = new THREE.Raycaster();

        var points = [];

        var y = -200;
        var a = 0;
        var r = 1000;
        var origin = new THREE.Vector3();
        var direction = new THREE.Vector3();
        for( var j = 0; j < 6000; j++ ) {
          a += .05;
          y += 0.075;
          origin.set( r * Math.cos( a ), y, r * Math.sin( a ) );
          direction.set( -origin.x, 0, -origin.z );
          direction = direction.normalize();
          raycaster.set( origin, direction );

          var i = raycaster.intersectObject( o, true );
          if( i.length ) {
            points.push( i[ 0 ].point.x, i[ 0 ].point.y, i[ 0 ].point.z );
          }
        }

        var l = new THREE.MeshLine();
        l.setGeometry( points, function( p ) { return p } );
        var line = new THREE.Mesh( l.geometry, this.materials.meshLine );
        this.objects.crystalObjs.push(line)
      }
  }

    b5Scene.readModel = function () {
      this.counters.crystalsLoaded = 0
      this.counters.crystalsRes = []
      const b5scene = this
      return new Promise( function( resolve, reject ) {
        let loader = new THREE.OBJLoader();
        loader.load( './obj/b2_1.obj', function( res ) {
          this.counters.crystalsLoaded += 1
          this.counters.crystalsRes.push(res)
          if (this.counters.crystalsLoaded === 3) {resolve(this.counters.crystalsRes)}
        }.bind(b5scene))
        loader.load( './obj/b2_2.obj', function( res ) {
          this.counters.crystalsLoaded += 1
          this.counters.crystalsRes.push(res)
          if (this.counters.crystalsLoaded === 3) {resolve(this.counters.crystalsRes)}
        }.bind(b5scene))
        loader.load( './obj/b2_3.obj', function( res ) {
          this.counters.crystalsLoaded += 1
          this.counters.crystalsRes.push(res)
          if (this.counters.crystalsLoaded === 3) {resolve(this.counters.crystalsRes)}
        }.bind(b5scene))
      });
    }

    b5Scene.makeLine = function (geo) {
    	var g = new THREE.MeshLine();
    	g.setGeometry(geo);

    	var mesh = new THREE.Mesh( g.geometry, material );
    	mesh.position.z += 500;
    	mesh.position.y += 300;
    	mesh.rotation.y = -Math.PI / 2;
    	mesh.rotation.z = Math.PI;
    	this.scene.add( mesh );

    	return mesh;
    }

    b5Scene.prepCamera = function () {
      const camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        15000
      );
      camera.position.set(0, 1250, 1250);
      camera.lookAt(0,0,0);

      this.camera = camera;
    }

    b5Scene.prepPlane = function () {
      let geom = new THREE.PlaneGeometry(400, 400, 32)
      let mat = new THREE.MeshBasicMaterial({
        color: 0x555555,
        side: THREE.DoubleSide,
        wireframe: true,
      })
      let plane = new THREE.Mesh(geom, mat)
      plane.scale.set(10,10,1)
      plane.rotation.set(1.57,0,0)
      this.scene.add(plane)
      this.objects.plane = plane
    }

    b5Scene.uniqueSetup = function () {
      window.crystals = this.objects.crystals = []
      window.raycaster = this.raycaster
      this.counters.currentCrystal = 0
      this.materials = {}
      this.prepObjects()
      this.readModel().then(collectPoints.bind(this));
      document.querySelector('canvas').addEventListener('click', function(e) {
        if (e.ctrlKey) {
          this.maybeCreateCrystal()
        }
        if (e.shiftKey) {

        }
      }.bind(this))

      return (
        function() {
          this.incrementCounters()
          this.handleRaycasterIntersection()

        }.bind(this)
      )
    }

    b5Scene.init();

    return b5Scene;
  }
}

export default b5;
