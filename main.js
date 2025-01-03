// See https://stackoverflow.com/questions/35246590/how-to-add-a-mtl-texture-to-an-obj-in-three-js


// ThreeJS stuff
// See https://threejs.org/examples/#webgl_loader_obj_mtl
// See https://threejs.org/examples/#webgl_effects_ascii
//
// ThreeJS Testing
// https://stackoverflow.com/questions/43205098/how-to-render-normals-to-surface-of-object-in-three-js

// Example models: https://github.com/alecjacobson/common-3d-test-models
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// pipeline composition
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';


let composer;
let camera, scene, renderer;
let object;

function initObjSingleTexture(objFile, textureFile) {
  // manager
  function loadModel() {
    object.traverse( function ( child ) {
      // if ( child.isMesh ) child.material.map = texture;
      if ( child instanceof THREE.Mesh ) {
	// Compute normals
	// child.geometry.computeVertexNormals();
	if (textureFile) {
	  child.material.map = texture;
	} else {
	  child.material = new THREE.MeshLambertMaterial( { color: 0xff6600 });
	  child.material.shading = THREE.SmoothShading;
	}
      }
    });

    const bbox = new THREE.Box3().setFromObject(object);
    // console.log('!!!', bbox, object.position);
    const lx = (bbox.max.x - bbox.min.x);
    const ly = (bbox.max.y - bbox.min.y);
    const lz = (bbox.max.z - bbox.min.z);
    const scale = ((lx + ly + lz) / 3) / 10;


    object.scale.setScalar( scale );
    scene.add( object );
  }

  const manager = new THREE.LoadingManager( loadModel );

  // texture
  const textureLoader = new THREE.TextureLoader( manager );
  const texture = textureLoader.load( textureFile, renderLoop );
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
  loader.load(objFile, function ( obj ) {
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

  initObjSingleTexture('models/spot.obj', 'models/texture_test.JPG');
  // initObjMTL();
 
  const boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );
  const boxMaterial = new THREE.MeshLambertMaterial( { color: "#433F81" } );
  const cube = new THREE.Mesh( boxGeometry, boxMaterial );
  cube.position.x = 0.3;
  cube.position.y = 0.3;
  cube.scale.setScalar(0.15);
  scene.add( cube );


  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.minDistance = 1;
  controls.maxDistance = 8;
  controls.addEventListener( 'change', renderLoop );

  window.addEventListener( 'resize', onWindowResize );


  composer = new EffectComposer( renderer );
  const renderPass = new RenderPass(scene, camera);
  composer.addPass( renderPass );

  const glitchPass = new GlitchPass(64);
  glitchPass.renderToScreen = true;
  composer.addPass( glitchPass );

  const outputPass = new OutputPass();
  composer.addPass( outputPass );

  // Old Film Look
  // const filmPass = new FilmPass();
  // composer.addPass(filmPass);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function renderLoop() {
  // renderer.render( scene, camera );
  composer.render();
}

init();

// Attach
document.body.appendChild( renderer.domElement );

function animate() {
  // renderer.render( scene, camera );
  renderLoop();
}
renderer.setAnimationLoop( animate );
