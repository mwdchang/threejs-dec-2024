// See https://stackoverflow.com/questions/35246590/how-to-add-a-mtl-texture-to-an-obj-in-three-js
// See https://threejs.org/examples/#webgl_loader_obj_mtl

import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, scene, renderer;
let object;

function initObjSingleTexture() {
  // manager
  function loadModel() {
    object.traverse( function ( child ) {
      if ( child.isMesh ) child.material.map = texture;
    });

    object.position.y = - 0.95;
    object.scale.setScalar( 0.01 );
    scene.add( object );
    render();
  }

  const manager = new THREE.LoadingManager( loadModel );

  // texture
  const textureLoader = new THREE.TextureLoader( manager );
  const texture = textureLoader.load( 'male02/01_-_Default1noCulling.JPG', render );
  texture.colorSpace = THREE.SRGBColorSpace;

  // model
  function onProgress( xhr ) {
    if ( xhr.lengthComputable ) {
      const percentComplete = xhr.loaded / xhr.total * 100;
      console.log( 'model ' + percentComplete.toFixed( 2 ) + '% downloaded' );
    }
  }
  function onError() {}

  const loader = new OBJLoader( manager );
  loader.load( 'male02/male02.obj', function ( obj ) {
      object = obj;
  }, onProgress, onError );

}

function initObjMTL() {
  function onProgress( xhr ) {
    if ( xhr.lengthComputable ) {
      const percentComplete = xhr.loaded / xhr.total * 100;
      console.log( 'model ' + percentComplete.toFixed( 2 ) + '% downloaded' );
    }
  }
  function onError() {}

  new MTLLoader()
    .setPath('male02/')
    .load('male02.mtl', function (materials) {
      materials.preload()

      new OBJLoader() 
        .setMaterials(materials)
        .setPath('male02/')
        .load('male02.obj', function (object) { 
	  object.position.y = -0.95;
	  object.scale.setScalar(0.01);
	  scene.add(object);
	}, onProgress);
    });
}



function init() {
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 20 );
  camera.position.z = 2.5;

  // scene
  scene = new THREE.Scene();

  const ambientLight = new THREE.AmbientLight( 0xffffff );
  scene.add( ambientLight );

  const pointLight = new THREE.PointLight( 0xffffff, 15 );
  camera.add( pointLight );
  scene.add( camera );

  // initObjSingleTexture();
  initObjMTL();

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.minDistance = 2;
  controls.maxDistance = 5;
  controls.addEventListener( 'change', render );

  window.addEventListener( 'resize', onWindowResize );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function render() {
  renderer.render( scene, camera );
}


init();


// Attach
document.body.appendChild( renderer.domElement );

function animate() {
  renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );
