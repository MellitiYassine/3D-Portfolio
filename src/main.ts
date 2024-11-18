import { GUI } from 'dat.gui';
import Stats from 'stats.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// Scene Setup
const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));

// Lighting
const light = new THREE.PointLight(0xffffff, 1000);
light.position.set(2.5, 7.5, 15);
scene.add(light);

// Camera Setup
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(1.5, 1.9, 1.9);

// Renderer Setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls Setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

// Stats Setup
const stats = new Stats();
document.body.appendChild(stats.dom);

// Variables
let mixer: THREE.AnimationMixer;
const animationActions: THREE.AnimationAction[] = [];
let activeAction: THREE.AnimationAction;
let lastAction: THREE.AnimationAction;
const movement = {
  forward: false,
  backward: false,
  left: false,
  right: false,
};
const movementSpeed = 5;
const rotationSpeed = 6;
let lastPosition = new THREE.Vector3();
let character: THREE.Object3D | undefined;

// Loaders
const fbxLoader: FBXLoader = new FBXLoader();

// Event Listeners for Movement
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
window.addEventListener('resize', onWindowResize, false);

// Animation Controls
const animations = {
  idle: () => setAction(animationActions[0]),
  slowRun: () => setAction(animationActions[1]),
};
const gui = new GUI();
const animationsFolder = gui.addFolder('Animations');
animationsFolder.open();

// Functions

function handleKeyDown(event: KeyboardEvent): void {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      movement.forward = true;
      break;
    case 'ArrowDown':
    case 'KeyS':
      movement.backward = true;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      movement.left = true;
      break;
    case 'ArrowRight':
    case 'KeyD':
      movement.right = true;
      break;
  }
}

function handleKeyUp(event: KeyboardEvent): void {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      movement.forward = false;
      break;
    case 'ArrowDown':
    case 'KeyS':
      movement.backward = false;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      movement.left = false;
      break;
    case 'ArrowRight':
    case 'KeyD':
      movement.right = false;
      break;
  }
}

function updateCharacterPosition(delta: number): void {
  if (!character) return;

  if (movement.forward) character.position.z -= movementSpeed * delta;
  if (movement.backward) character.position.z += movementSpeed * delta;
  if (movement.left) character.rotation.y += rotationSpeed * delta;
  if (movement.right) character.rotation.y -= rotationSpeed * delta;
}

function updateCharacterAnimation(): void {
  if (!character || !mixer) return;

  const currentPosition = character.position.clone();
  const isMoving = !currentPosition.equals(lastPosition);

  if (isMoving) {
    setAction(animationActions[1]); // 'Run' animation
  } else {
    setAction(animationActions[0]); // 'Idle' animation
  }

  lastPosition.copy(currentPosition);
}

function setAction(toAction: THREE.AnimationAction): void {
  if (toAction !== activeAction) {
    lastAction = activeAction;
    activeAction = toAction;
    lastAction.fadeOut(1);
    activeAction.reset();
    activeAction.fadeIn(1);
    activeAction.play();
  }
}

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

function render(): void {
  renderer.render(scene, camera);
}

// Load Character and Animations
fbxLoader.load(
  'models/Idle.fbx',
  (object) => {
    object.scale.set(0.005, 0.005, 0.005);
    character = object;

    mixer = new THREE.AnimationMixer(object);

    const animationAction = mixer.clipAction(
      (object as THREE.Object3D).animations[0]
    );
    animationActions.push(animationAction);
    animationsFolder.add(animations, 'idle');
    activeAction = animationAction;
    activeAction.play();
    scene.add(object);

    fbxLoader.load('models/SlowRun.fbx', (object) => {
      const animationAction = mixer.clipAction(
        (object as THREE.Object3D).animations[0]
      );
      animationActions.push(animationAction);
      animationsFolder.add(animations, 'slowRun');
    });
  },
  (xhr) => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
  (error) => console.error(error)
);

// Background Setup
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

// Animation Loop
const clock = new THREE.Clock();

function animate(): void {
  requestAnimationFrame(animate);

  controls.update();

  const delta = clock.getDelta();

  if (mixer) mixer.update(delta);

  updateCharacterPosition(delta);
  updateCharacterAnimation();

  render();
  stats.update();
}

animate();
