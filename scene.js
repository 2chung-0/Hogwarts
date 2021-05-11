import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/OBJLoader.js';
import { RectAreaLightHelper } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { Water } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/objects/Water.js';
import { Lensflare, LensflareElement } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/objects/Lensflare.js';
import { RGBELoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/RGBELoader.js';
import { CinematicCamera } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/cameras/CinematicCamera.js';
import { GUI } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/libs/dat.gui.module.js';

let container;
let camera, scene, renderer;
let water, sun;
let light_ambient, light, light1;
let sound;
let envMap;
let gui;


let change_mode = true;

init();
animate();

function init() {
    // set scene
    container = document.getElementById( 'container' );

    scene = new THREE.Scene();
    sun = new THREE.Vector3();
    
    //set camera

    camera = new CinematicCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.setLens( 5 );
    camera.position.set(0, 30, 250 );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild( renderer.domElement );

    // audio
    const listener = new THREE.AudioListener();
    camera.add( listener );
    sound = new THREE.Audio( listener );

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load( 'harryporter.mp3', function( buffer ) {
    sound.setBuffer( buffer );
    sound.setLoop( true );
    sound.setVolume( 0.5 );
    sound.play();
    });




    const waterGeometry = new THREE.PlaneGeometry( 15000, 15000 );

    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load( 'waternormals.jpg', function ( texture ) {

                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

            } ),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x000000,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );

    water.rotation.set(Math.PI/2, Math.PI, 0);


    scene.add( water );
    water.castShadow = true;
    water.receiveShadow = true;
    const pmremGenerator = new THREE.PMREMGenerator( renderer );
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 2);
    controls.update();


    const textureLoader = new THREE.TextureLoader();
    
    
    light_ambient = new THREE.HemisphereLight( 0x8da2b0, 0x000000, 0.5 );
    scene.add( light_ambient );

    light = new THREE.DirectionalLight( 0x8da2b0, 0.5, 100 );
    light.position.set( 0, 1, 0 ); //default; light shining from top
    light.castShadow = true; // default false
    scene.add( light );

    //Set up shadow properties for the light
    light.shadow.mapSize.width = 512; // default
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 500; // default



    const objLoader = new OBJLoader();
    let stage;

    new RGBELoader()
					.setDataType( THREE.UnsignedByteType )
					.load( 'nebula.hdr', function ( texture ) {

						envMap = pmremGenerator.fromEquirectangular( texture ).texture;
                        scene.background = envMap;
                        scene.environment = envMap;
                        texture.dispose();
						pmremGenerator.dispose();
						render();
						// model
                        const Material_rock = new THREE.MeshPhysicalMaterial( { color: 0x110, roughness: 0, metalness: 0.5 } );
                        const Material_wall = new THREE.MeshPhysicalMaterial( { color: 0x110, roughness: 0, metalness: 0.5 } );
                        const Material_castle = new THREE.MeshPhysicalMaterial( { color: 0x152932, roughness: 0, metalness: 0.1} );
                        objLoader.load('rock.obj',     
                            function (obj) {
                                stage = obj;
                                stage.castShadow = true;
                                stage.receiveShadow = true;
                                stage.traverse(function (child) { child.castShadow = true; child.receiveShadow = true; });
                                stage.scale.set(0.04, 0.04, 0.04);
                                stage.rotation.set(0, Math.PI, 0);
                                for ( let i = 0 ; i < stage.children.length; i++) {
                                    stage.children[i].material = Material_rock;
                                }
                                scene.add(stage);
                            }
                            );
                        objLoader.load('walls.obj',     
                            function (obj) {
                                stage = obj;
                                stage.castShadow = true;
                                stage.receiveShadow = true;
                                stage.traverse(function (child) { child.castShadow = true; child.receiveShadow = true; });
                                stage.scale.set(0.04, 0.04, 0.04);
                                stage.rotation.set(0, Math.PI, 0);
                                for ( let i = 0 ; i < stage.children.length; i++) {
                                    stage.children[i].material = Material_wall;
                                }
                                scene.add(stage);
                            }
                            );
                        objLoader.load('castle.obj',     
                            function (obj) {
                                stage = obj;
                                stage.castShadow = true;
                                stage.receiveShadow = true;
                                stage.traverse(function (child) { child.castShadow = true; child.receiveShadow = true; });
                                stage.scale.set(0.04, 0.04, 0.04);
                                stage.rotation.set(0, Math.PI, 0);
                                for ( let i = 0 ; i < stage.children.length; i++) {
                                    stage.children[i].material = Material_castle;
                                }
                                scene.add(stage);
                            }
                            );
    

					} );


    				const effectController = {

                        focalLength: 5,

                        fstop: 2.8,
                        maxblur: 100.0,
                        depthblur: true,
                        focalDepth: 3,

    
                    };
    
                    const matChanger = function ( ) {
    
                        for ( const e in effectController ) {
    
                            if ( e in camera.postprocessing.bokeh_uniforms ) {
    
                                camera.postprocessing.bokeh_uniforms[ e ].value = effectController[ e ];
    
                            }
    
                        }
    
                        camera.postprocessing.bokeh_uniforms[ 'znear' ].value = camera.near;
                        camera.postprocessing.bokeh_uniforms[ 'zfar' ].value = camera.far;
                        camera.setLens( effectController.focalLength, camera.frameHeight, effectController.fstop, camera.coc );
                        effectController[ 'focalDepth' ] = camera.postprocessing.bokeh_uniforms[ 'focalDepth' ].value;
    
                    };
    
                    //
    
                    gui = new GUI();
    
                    gui.add( effectController, 'focalLength', 1, 135, 0.01 ).onChange( matChanger );

                    
    
        


    const sphere = new THREE.SphereGeometry( 0.2, 16, 4 );
    light1 = new THREE.PointLight( 0xffaa00, 2, 0 );
    light1.position.set( 14.5, 86, 18.5);
    light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );
    light1.intensity = 0;
    const lensflare = new Lensflare();
    const textureFlare0 = textureLoader.load( "lensflare0.png" );
    lensflare.addElement( new LensflareElement( textureFlare0, 150, 0 ) );
    light1.add( lensflare );
    light1.castShadow = true;
    light1.shadow.mapSize.width = 512; // default
    light1.shadow.mapSize.height = 512; // default
    light1.shadow.camera.near = 0.5; // default
    light1.shadow.camera.far = 500; // default

    scene.add( light1 );

    window.addEventListener( 'resize', onWindowResize );
    document.body.addEventListener('keydown', keyPressed);
}


function animate() {
    render();
}

function render() {
    const time = Date.now() * 0.0005;
    const term = 14;
    if (!change_mode){
        if (sound.context.currentTime < term ){
        camera.position.x = Math.sin( sound.context.currentTime * 0.1 ) * 30+10;
        camera.position.y = Math.cos( sound.context.currentTime * 0.3 ) * 40+100;
        camera.position.z = Math.sin( sound.context.currentTime * 0.1 ) * 30;
        camera.setLens(5);
        }
        else if (sound.context.currentTime >= term && sound.context.currentTime < term*2){
            camera.position.x = Math.cos( time * 0.3 ) * 30;
            camera.position.y = Math.sin( time * 0.5 ) * 40+100;
            camera.position.z = Math.sin( time * 0.7 ) * 30+100;
            camera.setLens(55);
            
        }
        else if (sound.context.currentTime >= term*2 && sound.context.currentTime < term*3){
            camera.position.x = Math.sin( time * 0.7 ) * 30+100;
            camera.position.y = Math.cos( time * 0.5 ) * 40+100;
            camera.position.z = Math.cos( time * 0.3 ) * 30;
            camera.setLens(15);
        }
        else if (sound.context.currentTime >= term*3 && sound.context.currentTime < term*4){
            camera.position.x = Math.sin( sound.context.currentTime * 0.1 ) * 30+10;
            camera.position.y = Math.cos( sound.context.currentTime * 0.3 ) * 40+80;
            camera.position.z = Math.sin( sound.context.currentTime * 0.1 ) * 30;
            camera.setLens(1);
        }
        else if (sound.context.currentTime >= term*4 && sound.context.currentTime < term*5){
            camera.position.x = Math.cos( time * 0.3 ) * 30+100;
            camera.position.y = Math.sin( time * 0.5 ) * 40+100;
            camera.position.z = Math.sin( time * 0.7 ) * 30;
            camera.setLens(55);
            
        }
        else if (sound.context.currentTime >= term*5 && sound.context.currentTime < term*6){
            camera.position.x = Math.sin( time * 0.7 ) * 30;
            camera.position.y = Math.cos( time * 0.5 ) * 40+100;
            camera.position.z = Math.cos( time * 0.3 ) * 30+100;
            camera.setLens(15);
        }
        else if (sound.context.currentTime >= term*6 && sound.context.currentTime < term*7){
            camera.position.x = Math.cos( time * 0.3 ) * 30;
            camera.position.y = Math.sin( time * 0.5 ) * 40+100;
            camera.position.z = Math.sin( time * 0.7 ) * 30+100;
            camera.setLens(1);
        }
        else if (sound.context.currentTime >= term*7 && sound.context.currentTime < term*8){
            camera.position.x = Math.sin( sound.context.currentTime * 0.1 ) * 30+10;
            camera.position.y = Math.cos( sound.context.currentTime * 0.3 ) * 40+100;
            camera.position.z = Math.sin( sound.context.currentTime * 0.1 ) * 30;
            camera.setLens(5);
            }
            else if (sound.context.currentTime >= term*8 && sound.context.currentTime < term*9){
                camera.position.x = Math.cos( time * 0.3 ) * 30;
                camera.position.y = Math.sin( time * 0.5 ) * 40+100;
                camera.position.z = Math.sin( time * 0.7 ) * 30+100;
                camera.setLens(55);
                
            }
            else if (sound.context.currentTime >= term*9 && sound.context.currentTime < term*10){
                camera.position.x = Math.sin( time * 0.7 ) * 30+100;
                camera.position.y = Math.cos( time * 0.5 ) * 40+100;
                camera.position.z = Math.cos( time * 0.3 ) * 30;
                camera.setLens(15);
            }
            else if (sound.context.currentTime >= term*10 && sound.context.currentTime < term*11){
                camera.position.x = Math.sin( sound.context.currentTime * 0.1 ) * 30+10;
                camera.position.y = Math.cos( sound.context.currentTime * 0.3 ) * 40+80;
                camera.position.z = Math.sin( sound.context.currentTime * 0.1 ) * 30;
                camera.setLens(1);
            }
            else if (sound.context.currentTime >= term*11 && sound.context.currentTime < term*12){
                camera.position.x = Math.cos( time * 0.3 ) * 30+100;
                camera.position.y = Math.sin( time * 0.5 ) * 40+100;
                camera.position.z = Math.sin( time * 0.7 ) * 30;
                camera.setLens(55);
                
            }
            else if (sound.context.currentTime >= term*12 && sound.context.currentTime < term*13){
                camera.position.x = Math.sin( time * 0.7 ) * 30;
                camera.position.y = Math.cos( time * 0.5 ) * 40+100;
                camera.position.z = Math.cos( time * 0.3 ) * 30+100;
                camera.setLens(15);
            }
            else if (sound.context.currentTime >= term*13 && sound.context.currentTime < term*14){
                camera.position.x = Math.cos( time * 0.3 ) * 30;
                camera.position.y = Math.sin( time * 0.5 ) * 40+100;
                camera.position.z = Math.sin( time * 0.7 ) * 30+100;
                camera.setLens(1);
            }

            if (sound.context.currentTime >= term*14){
                camera.position.x = Math.sin( sound.context.currentTime * 0.1 ) * 30+10;
                camera.position.y = Math.cos( sound.context.currentTime * 0.3 ) * 40+100;
                camera.position.z = Math.sin( sound.context.currentTime * 0.1 ) * 30;
                camera.setLens(5);
            }



        camera.lookAt( scene.position );
    }

    water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

function keyPressed(e){
    console.log(e);
    switch(e.key) {
        
      case 'Enter':
        if(change_mode){
            change_mode = false;
        } else {
            change_mode = true;
        }
            break;

    }
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}



