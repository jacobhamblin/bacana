// b5.js

import THREE from 'three';
import bScene from './bScene.js';
import TweenLite from 'gsap';
import { LinkedList, GraphNode } from './utils'
import { MeshLine, MeshLineMaterial } from './vendor';

const b5 = {
  init({container, renderer}) {
    console.log('initialized b5!')
    const b5Scene = bScene.create({container, renderer});

    b5Scene.createCrystal = function() {
      let { currentCrystal } = this.counters
      let { x, y, z } = this.raycaster.intersected.plane.pos

      let crystal = this.objects.crystalObjs[currentCrystal].clone()
      crystal.material = this.objects.crystalObjs[currentCrystal].material.clone();
      crystal.material.oldColor = crystal.material.color;
      crystal.position.set(x, y, z)
      crystal.graphNode = new GraphNode({mesh: crystal})
      this.scene.add(crystal)
      this.objects.crystals.push(crystal)

      this.counters.currentCrystal = (currentCrystal + 1) % 3
    }

    b5Scene.createEdge = function() {
      let { raycaster } = this
      let { x, y, z } = raycaster.intersected.crystal.pos

      let material = new THREE.MeshBasicMaterial({color: this.colors[2]})
      let geometry = new THREE.Geometry()
      geometry.vertices.push(new THREE.Vector3(x, y + 5, z))
      geometry.vertices.push(new THREE.Vector3(x + 1, y + 5, z))
      let line = new THREE.Line(geometry, material)
      this.scene.add(line)
      raycaster.creatingEdge = line
      raycaster.intersected.firstCrystal = raycaster.intersected.crystal.obj
    }

    b5Scene.click = function(e) {
      if (e.ctrlKey || e.metaKey) {
        this.maybeCreateCrystal()
      }
    }

    b5Scene.destroy = function() {
      cancelAnimationFrame(this.animFrameReq);
      this.scene = null;
      this.projector = null;
      this.camera = null;
      this.controls = null;
      this.objects = null;
      this.lights = null;
      this.counters = null;
      this.raycaster = null;
      this.ended = true;

      document.querySelector('canvas').removeEventListener('mousedown', this.mousedown.bind(this))
      document.querySelector('canvas').removeEventListener('mouseup', this.mouseup.bind(this))
      document.querySelector('canvas').removeEventListener('mousemove', this.mousemove.bind(this))
      document.querySelector('canvas').removeEventListener('click', this.click.bind(this))
    }

    b5Scene.finishEdge = function() {
      let { raycaster } = this
      let { intersected, creatingEdge } = raycaster

      if (intersected.crystal.obj &&
        intersected.crystal.obj !== intersected.firstCrystal) {
        creatingEdge.geometry.vertices[1] = raycaster.intersected.crystal.pos
        creatingEdge.geometry.verticesNeedUpdate = true;
        creatingEdge.geometry.dynamic = true;

        intersected.crystal.obj.graphNode.add(intersected.firstCrystal.graphNode)
      } else {
        this.scene.remove(raycaster.creatingEdge)
      }

      raycaster.creatingEdge = false
      raycaster.intersected.firstCrystal = null
    }

    b5Scene.handleRaycasterIntersection = function() {
      let { crystalObjs } = this.objects
      this.raycaster.raycaster.setFromCamera(this.mouse, this.camera)
      let intersects = this.raycaster.raycaster.intersectObjects(this.scene.children)

      if (intersects.length > 0) {
        let crystal = {obj: null, pos: null};
        let plane = {obj: null, pos: null};

        intersects.forEach(i => {
          if (i.object === this.objects.plane) {
            plane.obj = this.objects.plane
            plane.pos = i.point
          } else if (i.object.graphNode) {
            crystal.obj = i.object
            crystal.pos = i.object.position
            b5Scene.pointerCursor()
          }
        })

        this.raycaster.intersected.plane.obj = plane.obj
        this.raycaster.intersected.plane.pos = plane.pos
        this.raycaster.intersected.crystal.obj = crystal.obj
        this.raycaster.intersected.crystal.pos = crystal.pos
        if (crystal.obj === null) b5Scene.initialCursor()
      }
    }

    b5Scene.incrementCounters = function() {
      this.counters.a += 0.02;
    }

    b5Scene.initialCursor = function() {
      document.body.style.cursor = 'initial'
    }

    b5Scene.mousedown = function(e) {
      this.mouseState.mouseDown = true
    }

    b5Scene.mousemove = function(e) {
      if (this.mouseState.mouseDown && e.shiftKey) {
        this.maybeCreateEdge()
      }
    }

    b5Scene.mouseup = function(e) {
      this.mouseState.mouseDown = false
      if (this.raycaster.creatingEdge) {
        this.finishEdge()
      }
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

    b5Scene.maybeCreateCrystal = function() {
      let { raycaster } = this

      if (raycaster.intersected.crystal.obj) {
        this.maybeSetRoot()
      } else if (raycaster.intersected.plane.obj) {
        this.createCrystal()
      }
    }

    b5Scene.maybeCreateEdge = function() {
      let { crystalObjs } = this.objects
      let { raycaster, mouseState } = this
      if (raycaster.intersected.crystal.obj && raycaster.creatingEdge === false) {
        this.createEdge()
      } else if (raycaster.creatingEdge) {
        this.updateEdge()
      }
    }

    b5Scene.maybeSetRoot = function() {
      let { raycaster } = this

      if (raycaster.intersected.crystal.obj) {
        if (this.rootNode) {
          this.rootNode.mesh.material.color = this.rootNode.mesh.material.oldColor
          this.rootNode = raycaster.intersected.crystal.obj.graphNode
        } else {
          this.rootNode = raycaster.intersected.crystal.obj.graphNode
        }

        this.rootNode.mesh.material.color = new THREE.Color(this.colors[6])
      }
    }

    b5Scene.prepObjects = function () {
      this.prepPlane();
      this.objects.crystalObjs = []
    }

    function collectPoints( sources ) {

      window.THREE = THREE;
      let resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );

      for (var h = 0; h < sources.length; h++) {
        let color = this.colors[h + 1]

        // let material = new THREE.MeshLineMaterial( {
        // 	map: THREE.ImageUtils.loadTexture( '../img/stroke.png' ),
        // 	useMap: false,
        // 	color: new THREE.Color( this.colors[ color ] ),
        // 	opacity: 0.5,
        // 	resolution: resolution,
        // 	sizeAttenuation: false,
        // 	lineWidth: 10,
        // 	near: this.camera.near,
        // 	far: this.camera.far,
        // 	depthWrite: false,
        // 	depthTest: false,
        // 	transparent: true
        // });

        let material = new THREE.MeshBasicMaterial({
          color,
          opacity: 0.5,
          transparent: true
        })

        let source = sources[h]
        var g = source.children[ 0 ].geometry;
        g.center()
        var scaleMatrix = new THREE.Matrix4();
        scaleMatrix.makeScale( 1, 1, 1 );
        g.applyMatrix( scaleMatrix );

        var o = new THREE.Mesh( g, material );
        this.objects.crystalObjs.push(o)

        // var raycaster = new THREE.Raycaster();
        //
        // var points = [];
        //
        // var y = -200;
        // var a = 0;
        // var r = 1000;
        // var origin = new THREE.Vector3();
        // var direction = new THREE.Vector3();
        // for( var j = 0; j < 6000; j++ ) {
        //   a += .05;
        //   y += 0.075;
        //   origin.set( r * Math.cos( a ), y, r * Math.sin( a ) );
        //   direction.set( -origin.x, 0, -origin.z );
        //   direction = direction.normalize();
        //   raycaster.set( origin, direction );
        //
        //   var i = raycaster.intersectObject( o, true );
        //   if( i.length ) {
        //     points.push( i[ 0 ].point.x, i[ 0 ].point.y, i[ 0 ].point.z );
        //   }
        // }
        //
        // var l = new THREE.MeshLine();
        // l.setGeometry( points, function( p ) { return p } );
        // var line = new THREE.Mesh( l.geometry, material );
        // l.setMatrixWorld(line.matrixWorld);
        // this.objects.meshLines.push(l)
        // this.objects.crystalObjs.push(line)
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

    b5Scene.pointerCursor = function() {
      document.body.style.cursor = 'pointer'
    }

    b5Scene.uniqueSetup = function () {
      window.crystals = this.objects.crystals = []
      window.raycaster = this.raycaster
      this.counters.currentCrystal = 0
      this.mouseState = {}
      this.mouseState.mouseDown = false
      this.raycaster.creatingEdge = false
      this.rootNode = null
      this.raycaster.intersected = {
        plane: {obj: null, pos: null},
        crystal: {obj: null, pos: null},
        firstCrystal: null,
      }
      this.colors = [
        0xB4F0A8, 0xA8F0B4, 0xA8F0CC, 0xA8F0E4, 0xA8E4F0,
        0xA8CCF0, 0xA8C0F0, 0xA8A8F0, 0xC0A8F0, 0xD8A8F0,
        0xF0A8F0, 0xF0A8D8, 0xF0A8C0, 0xF0A8A8, 0xF0C0A8,
        0xF0D8A8, 0xF0F0A8
      ];

      this.prepObjects()
      this.readModel().then(collectPoints.bind(this));
      document.querySelector('canvas').addEventListener('click', this.click.bind(this))
      document.querySelector('canvas').addEventListener('mousedown', this.mousedown.bind(this))
      document.querySelector('canvas').addEventListener('mouseup', this.mouseup.bind(this))
      document.querySelector('canvas').addEventListener('mousemove', this.mousemove.bind(this))

      return (
        function() {
          this.incrementCounters()
          this.handleRaycasterIntersection()

        }.bind(this)
      )
    }

    b5Scene.updateEdge = function() {
      let { raycaster } = this
      let {x, y, z} = raycaster.intersected.plane.pos

      raycaster.creatingEdge.geometry.vertices[1] = new THREE.Vector3(x, y + 5, z)
      raycaster.creatingEdge.geometry.verticesNeedUpdate = true;
      raycaster.creatingEdge.geometry.dynamic = true;
    }

    b5Scene.init();

    return b5Scene;
  }
}

export default b5;
