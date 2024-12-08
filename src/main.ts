import * as THREE from 'three';
import { AnimationAction, AnimationMixer } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import {
  loadAndAnimateAngularModel,
  loadJobModel,
  loadNameModel,
} from './fbx.instantiate';
import { initKeyboardEventListeners, initMouseEventListeners } from './event';
import {
  AXIS_Y,
  CAMERA_ALTITUDE,
  CAMERA_DISTANCE,
  CAMERA_SPEED,
  LOOK_AT_STEP,
} from './constants';
import { lerpAngle } from './movement';
import {
  createCamera,
  createLights,
  createRenderer,
  createScene,
} from './scene';

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
let isCameraAnimating = false;
let firstTimeCameraPointingToCharacter = true;

const scene = createScene();
const camera = createCamera();
const renderer = createRenderer();
const light = createLights();
// const background = createTexture();

scene.add(...light);
// scene.background = background;

loadAndAnimateAngularModel(scene, renderer, camera);
loadNameModel(scene, renderer, camera);
loadJobModel(scene, renderer, camera);
initMouseEventListeners(camera, renderer, mouse, state);
initKeyboardEventListeners(keyHash);

fbxLoader.load('models/Ty.fbx', (fbx) => {
  character = fbx;
  character.castShadow = true;
  character.receiveShadow = true;
  character.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });

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

function animationLoop() {
  resetCharacterDirection();

  const forward = getForwardDirection();
  const right = getRightDirection(forward);

  updateCharacterMovement(forward, right);

  if (character) {
    updateCharacterPosition();
    updateCharacterRotation();
    updateCameraPosition();
  }

  updateAnimationMixer();
  renderScene();
}

function resetCharacterDirection() {
  characterDir.set(0, 0, 0);
}

function getForwardDirection() {
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  return forward;
}

function getRightDirection(forward: THREE.Vector3) {
  const right = new THREE.Vector3();
  right.crossVectors(forward, AXIS_Y).normalize();
  return right;
}

function updateCharacterMovement(forward: THREE.Vector3, right: THREE.Vector3) {
  getCharacterControllerAndAnimations(forward, right);
}

function updateCharacterPosition() {
  character.position.addScaledVector(characterDir, characterSpeed * 0.03);
}

function updateCharacterRotation() {
  const targetRotationY = Math.atan2(characterDir.x, characterDir.z);
  character.rotation.y = lerpAngle(character.rotation.y, targetRotationY, 0.1);
}

function updateCameraPosition(): void {
  if (!state.isCameraAttached) return;

  const targetLookAt = character.position;

  if (!isCameraAnimating) {
    isCameraAnimating = true;
    animateCameraLinear(targetLookAt);
  }
}

function animateCameraLinear(targetLookAt: THREE.Vector3): void {
  const targetPosition = character.position
    .clone()
    .add(new THREE.Vector3(0, CAMERA_ALTITUDE, CAMERA_DISTANCE));

  const direction = targetPosition.clone().sub(camera.position).normalize();
  const distanceToMove = Math.min(
    CAMERA_SPEED,
    camera.position.distanceTo(targetPosition)
  );

  camera.position.add(direction.multiplyScalar(distanceToMove));

  const currentLookAt = camera.getWorldDirection(new THREE.Vector3());
  const newLookAt = targetLookAt.clone().sub(camera.position).normalize();
  const interpolatedLookAt = currentLookAt.lerp(newLookAt, LOOK_AT_STEP);
  camera.lookAt(camera.position.clone().add(interpolatedLookAt));

  if (camera.position.distanceTo(targetPosition) > 0.01) {
    requestAnimationFrame(() => animateCameraLinear(targetLookAt));

    if (firstTimeCameraPointingToCharacter) {
      firstTimeCameraPointingToCharacter = false;
      camera.lookAt(targetLookAt);
    }
  } else {
    camera.position.copy(targetPosition);
    camera.lookAt(targetLookAt);
    isCameraAnimating = false;
  }
}

function updateAnimationMixer() {
  if (mixer) mixer.update(0.016);
}

function renderScene() {
  renderer.render(scene, camera);
}

function getCharacterControllerAndAnimations(
  forward: THREE.Vector3,
  right: THREE.Vector3
) {
  getCharacterController(forward, right);
  getCharacterAnimations();
}

function getCharacterController(forward: THREE.Vector3, right: THREE.Vector3) {
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
}

function getCharacterAnimations() {
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
}

renderer.setAnimationLoop(animationLoop);
