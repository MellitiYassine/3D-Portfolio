import * as THREE from 'three';
import { AnimationAction, AnimationMixer } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { loadAndAnimateAngularModel } from './fbx.instantiate';
import { initKeyboardEventListeners, initMouseEventListeners } from './event';
import { AXIS_Y, CAMERA_ALTITUDE, CAMERA_DISTANCE } from './constants';
import { lerpAngle } from './movement';
import {
  createCamera,
  createLights,
  createRenderer,
  createScene,
  createTexture,
} from './scene.config';

let character: THREE.Object3D;
let characterSpeed = 0;
let characterDir = new THREE.Vector3(0, 0, -1);
let mixer: AnimationMixer;
let greetingAction: AnimationAction;
let idleAction: AnimationAction;
let slowRunAction: AnimationAction;
let fastRunAction: AnimationAction;
let activeAction: AnimationAction;
var keyHash: Record<string, boolean> = {};
let hasMoved = false;
const mouse = new THREE.Vector2();
const state = { isDragging: false, isCameraAttached: true };
const fbxLoader = new FBXLoader();

const scene = createScene();
const camera = createCamera();
const renderer = createRenderer();
const light = createLights();
const background = createTexture();

scene.add(light);
scene.background = background;

loadAndAnimateAngularModel(scene, renderer, camera);
initMouseEventListeners(camera, renderer, mouse, state);
initKeyboardEventListeners(keyHash);

fbxLoader.load('models/Ty.fbx', (fbx) => {
  character = fbx;
  character.scale.set(0.01, 0.01, 0.01);
  scene.add(character);

  mixer = new AnimationMixer(character);

  fbxLoader.load('animations/Greeting.fbx', (run) => {
    greetingAction = mixer.clipAction(run.animations[0]);
    greetingAction.play();
    activeAction = greetingAction;
  });

  fbxLoader.load('animations/Idle.fbx', (idle) => {
    idleAction = mixer.clipAction(idle.animations[0]);
    idleAction.play();
    activeAction = idleAction;
  });

  fbxLoader.load('animations/SlowRun.fbx', (run) => {
    slowRunAction = mixer.clipAction(run.animations[0]);
  });

  fbxLoader.load('animations/FastRun.fbx', (FastRun) => {
    fastRunAction = mixer.clipAction(FastRun.animations[0]);
  });
});

function switchAnimation(toAction: AnimationAction) {
  if (activeAction !== toAction) {
    activeAction.fadeOut(0.5);
    toAction.reset().fadeIn(0.5).play();
    activeAction = toAction;
  }
}

function animationLoop(t: number) {
  characterDir.set(0, 0, 0);

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(forward, AXIS_Y).normalize();

  if (keyHash['ArrowUp']) {
    state.isCameraAttached = true;
    characterDir.add(forward);
  }
  if (keyHash['ArrowDown']) {
    state.isCameraAttached = true;
    characterDir.sub(forward);
  }
  if (keyHash['ArrowRight']) {
    state.isCameraAttached = true;
    characterDir.add(right);
  }
  if (keyHash['ArrowLeft']) {
    state.isCameraAttached = true;
    characterDir.sub(right);
  }

  if (characterDir.length() > 0) {
    hasMoved = true;
    if (keyHash['Shift']) {
      characterSpeed = 2;
      if (fastRunAction) switchAnimation(fastRunAction);
    } else {
      characterSpeed = 1;
      if (slowRunAction) switchAnimation(slowRunAction);
    }
    characterDir.normalize();
  } else {
    characterSpeed *= 0.7;
    if (!hasMoved && greetingAction) {
      switchAnimation(greetingAction);
    } else if (idleAction) {
      switchAnimation(idleAction);
    }
  }

  if (character) {
    character.position.addScaledVector(characterDir, characterSpeed * 0.03);

    const targetRotationY = Math.atan2(characterDir.x, characterDir.z);
    character.rotation.y = lerpAngle(
      character.rotation.y,
      targetRotationY,
      0.1
    );
    if (state.isCameraAttached) {
      camera.position.lerp(
        character.position
          .clone()
          .add(new THREE.Vector3(0, CAMERA_ALTITUDE, CAMERA_DISTANCE)),
        0.01
      );
      camera.lookAt(character.position);
    }
  }

  if (mixer) mixer.update(0.016);

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animationLoop);
