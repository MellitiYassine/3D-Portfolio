import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { AnimationMixer, AnimationAction } from 'three';

console.clear();

var scene = new THREE.Scene();
scene.background = new THREE.Color('gainsboro');

var camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight);
camera.position.set(0, 100, 100);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d')!;
const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
gradient.addColorStop(0.2, '#de4313');
gradient.addColorStop(0.4, '#FD7F2C');
gradient.addColorStop(0.6, '#FD9346');
gradient.addColorStop(0.8, '#FD7F2C');
gradient.addColorStop(1, '#FD9346');
context.fillStyle = gradient;
context.fillRect(0, 0, canvas.width, canvas.height);
const texture = new THREE.CanvasTexture(canvas);
scene.background = texture;

const groundGeometry = new THREE.PlaneGeometry(10, 10);
const groundMaterial = new THREE.MeshBasicMaterial({
  color: 0x808080,
  side: THREE.DoubleSide,
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

const CAMERA_DISTANCE = 10,
  CAMERA_ALTITUDE = 3,
  AXIS_Y = new THREE.Vector3(0, 1, 0);

var keyHash: Record<string, boolean> = {};

window.addEventListener('keydown', (event) => (keyHash[event.key] = true));
window.addEventListener('keyup', (event) => (keyHash[event.key] = false));

function lerpAngle(a: number, b: number, k: number) {
  if (a - b > Math.PI) b += 2 * Math.PI;
  if (b - a > Math.PI) a += 2 * Math.PI;

  return THREE.MathUtils.lerp(a, b, k) % (2 * Math.PI);
}

let character: THREE.Object3D;
let characterSpeed = 0;
let characterDir = new THREE.Vector3(0, 0, -1);
let mixer: AnimationMixer;
let greetingAction: AnimationAction;
let idleAction: AnimationAction;
let slowRunAction: AnimationAction;
let fastRunAction: AnimationAction;
let activeAction: AnimationAction;
let hasMoved = false;

const fbxLoader = new FBXLoader();
fbxLoader.load(
  'models/Ty.fbx',
  (fbx) => {
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
  },
  (progress) => {
    console.log(`Loading: ${(progress.loaded / progress.total) * 100}%`);
  },
  (error) => {
    console.error('Error loading FBX:', error);
  }
);

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

  if (keyHash['ArrowUp']) characterDir.add(forward);
  if (keyHash['ArrowDown']) characterDir.sub(forward);
  if (keyHash['ArrowRight']) characterDir.add(right);
  if (keyHash['ArrowLeft']) characterDir.sub(right);

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

    camera.position.lerp(
      character.position
        .clone()
        .add(new THREE.Vector3(0, CAMERA_ALTITUDE, CAMERA_DISTANCE)),
      0.01
    );
    camera.lookAt(character.position);
  }

  if (mixer) mixer.update(0.016);

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animationLoop);
