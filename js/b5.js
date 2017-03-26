// b5.js

import THREE from 'three';
import bScene from './bScene.js';
import TweenLite from 'gsap';
import _ from 'lodash';
import { LinkedList, GraphNode, sleep } from './utils'
import { MeshLine, MeshLineMaterial } from './vendor';
import '../sass/b5.scss';
import dat from 'dat-gui';

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
      crystal.graphNode = new GraphNode({mesh: crystal, id: this.counters.currentGraphNodeID++})
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
      if (this.editable && e.ctrlKey || this.editable && e.metaKey) {
        this.maybeCreateCrystal()
      }
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
        this.updateHUD()
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
    
    b5Scene.graphTraversalCallback = function(method) {
      const callbackFinish = ({node, callbackQueue, callbackStart, target}) => {
        const { material } = node.mesh  
        material.color = material.currentColor
        this.highlightedNode = undefined
        if (node.id === target) return node;
        if (callbackQueue.length && !this.targetFound) callbackStart({callbackQueue, callbackFinish, target})
      }
      const callbackStart = async ({callbackQueue, callbackFinish, target}) => {
        const node = callbackQueue.shift()
        const targetNode = node.id === target
        const highlightColor = new THREE.Color(this.colors[this.colors.length - (targetNode ? 2 : 1)])
        this.highlightedNode = node
        const { material } = node.mesh
        material.currentColor = material.color
        material.color = highlightColor
        this.updateHUD()
        await sleep(targetNode ? 2200 - (this.speed * 200): 1100 - (this.speed * 100));
        callbackFinish({node, callbackQueue, callbackStart, target})
      }
      if (this.rootNode && this.targetNode) {
        this.editable = false
        this.targetFound = false
        this.rootNode[method]({
          target: this.targetNode.id, callback: callbackStart, callbackFinish, targetFound: this.targetFound
        })
        this.editable = true
      }
    }

    b5Scene.hudInit = function() {
      const gui = new dat.GUI({ autoPlace: false });
      gui.add(this, 'speed', 1, 10)
      
      let hudDOM = document.createElement('div')
      let b5Scene = this;
      hudDOM.className = 'hud'
      document.querySelector('.fullscreen.active').appendChild(hudDOM)
      this.HUD = hudDOM
      const buttonContainer = document.createElement('div')

      buttonContainer.className = 'buttonContainer'
      const dfs = document.createElement('a')
      dfs.innerHTML = 'dfs'
      dfs.addEventListener('click', e => b5Scene.graphTraversalCallback('dfs'))
      const bfs = document.createElement('a')
      bfs.innerHTML = 'bfs' 
      bfs.addEventListener('click', e => b5Scene.graphTraversalCallback('bfs'))
      buttonContainer.appendChild(bfs)
      buttonContainer.appendChild(dfs)
      const controls = document.createElement('div');
      controls.appendChild(gui.domElement);
      controls.appendChild(buttonContainer);
      controls.className = 'controls';
      this.HUD.appendChild(controls);
      const nodeContainer = document.createElement('div');
      nodeContainer.className = 'nodeContainer'
      this.HUD.appendChild(nodeContainer)
      const tips = document.createElement('div');
      tips.className = 'tips';
      const list = document.createElement('ul');
      const messages = [
        "Ctrl/cmd + click to place a node",
        "Shift + click and drag to connect nodes",
        "Ctrl/cmd + click node to set root node",
        "Shift click on a node to set as target",
      ];
      for (let i = 0; i < 4; i++) {
        let item = document.createElement('li');
        item.innerHTML = messages[i];
        list.appendChild(item);
      }
      tips.appendChild(list);
      this.HUD.appendChild(tips);
      
      this.tempMem.push('HUD')
      setTimeout(() => {
        hudDOM.style.opacity = '1'
        this.HUD.querySelector('.dg.main').style['width'] = '100%';
        this.HUD.querySelector('.close-button').style['width'] = '100%';
      }, 500)
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
      if (this.mouseState.mouseDown && e.shiftKey && this.editable) {
        this.maybeCreateEdge()
      }
    }

    b5Scene.mouseup = function(e) {
      this.mouseState.mouseDown = false
      if (this.raycaster && this.raycaster.creatingEdge) {
        this.finishEdge()
      } else if (e.shiftKey && this.editable) {
        this.maybeSetTarget()
      }
    }

    b5Scene.makeLine = function (geo) {
    	const g = new THREE.MeshLine();
    	g.setGeometry(geo);

    	const mesh = new THREE.Mesh( g.geometry, material );
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
        this.maybeSetSpecial('rootNode')
      } else if (raycaster.intersected.plane.obj) {
        this.createCrystal()
      }
    }

    b5Scene.maybeSetTarget = function() {
      let { raycaster } = this

      if (raycaster.intersected.crystal.obj) {
        this.maybeSetSpecial('targetNode')
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

    b5Scene.maybeSetSpecial = function(type) {
      let { raycaster } = this

      if (raycaster.intersected.crystal.obj) {
        if (this[type]) {
          this[type].mesh.material.color = this[type].mesh.material.oldColor
        }
        this[type] = raycaster.intersected.crystal.obj.graphNode

        let color = type === 'rootNode' ? 6 : this.colors.length - 1;
        this[type].mesh.material.color = new THREE.Color(this.colors[color])
        this.updateHUD();
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
      this.colors = [
        0xB4F0A8, 0xA8F0B4, 0xA8F0CC, 0xA8F0E4, 0xA8E4F0,
        0xA8CCF0, 0xA8C0F0, 0xA8A8F0, 0xC0A8F0, 0xD8A8F0,
        0xF0A8F0, 0xF0A8D8, 0xF0A8C0, 0xF0A8A8, 0xF0C0A8,
        0xF0D8A8, 0xF0F0A8
      ];
      this.counters.currentCrystal = 0
      this.counters.currentGraphNodeID = 1
      this.editable = true
      this.targetFound = false
      this.mouseState = {}
      this.mouseState.mouseDown = false
      this.raycaster.creatingEdge = false
      this.raycaster.intersected = {
        plane: {obj: null, pos: null},
        crystal: {obj: null, pos: null},
        firstCrystal: null,
      }
      this.rootNode = null
      this.speed = 5;

      this.prepObjects()
      this.readModel().then(collectPoints.bind(this));
      document.querySelector('canvas').addEventListener('click', this.click.bind(this))
      document.querySelector('canvas').addEventListener('mousedown', this.mousedown.bind(this))
      document.querySelector('canvas').addEventListener('mouseup', this.mouseup.bind(this))
      document.querySelector('canvas').addEventListener('mousemove', this.mousemove.bind(this))
      
      this.hudInit()

      this.destroyActions.push(
        () => {
           document.querySelector('canvas').removeEventListener('mousedown', this.mousedown.bind(this))
           document.querySelector('canvas').removeEventListener('mouseup', this.mouseup.bind(this))
           document.querySelector('canvas').removeEventListener('mousemove', this.mousemove.bind(this))
           document.querySelector('canvas').removeEventListener('click', this.click.bind(this))
        }
      )
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

    b5Scene.updateHUD = function() {
      if (this.rootNode) {
        let nodeContainer = this.HUD.querySelector('.nodeContainer')
        while (nodeContainer.firstChild) {
          nodeContainer.removeChild(nodeContainer.firstChild)
        }
        const levels = []
        this.rootNode.bfs({callback: ({node, target, path}) => {
          if (typeof levels[path.length] !== "object") levels[path.length] = []
          levels[path.length].push(node.id) 
          return false
        }})
        levels.forEach((l, index) => {
          const container = document.createElement('div')
          container.className = 'level'
          l.forEach(n => {
            const node = document.createElement('div')
            node.className = 'node'
            if (index === 0) node.className += ' root'
            if (this.targetNode && this.targetNode.id === n) node.className += ' target'
            if (this.highlightedNode && this.highlightedNode.id === n) node.className += ' current';
            container.appendChild(node)
          })
         nodeContainer.appendChild(container) 
        })   
      }
    }
    
    b5Scene.init();

    return b5Scene;
  }
}

export default b5;
