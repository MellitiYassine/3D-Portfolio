import * as THREE from 'three';

export function initMouseEventListeners(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  mouse: THREE.Vector2,
  state: { isDragging: boolean; isCameraAttached: boolean }

): void {
  window.addEventListener('resize', () => onWindowResize(camera, renderer));
  window.addEventListener('mousedown', () => (state.isDragging = true));
  window.addEventListener('mouseup', () => (state.isDragging = false));
  window.addEventListener('mousemove', (event) =>
    onMouseMove(event,camera, mouse, state)
  );
  window.addEventListener('wheel', (event) =>
    onMouseScroll(event, camera, mouse, state)
  );
  
}

function onWindowResize(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(
  event: MouseEvent,
  camera: THREE.PerspectiveCamera,
  mouse: THREE.Vector2,
  state: { isDragging: boolean; isCameraAttached: boolean }

): void {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  if (state.isDragging) {
    state.isCameraAttached = false;    
    camera.position.x -= (event.movementX / window.innerWidth) * 10;
    camera.position.z -= (event.movementY / window.innerHeight) * 10;
  }
}

function onMouseScroll(
  event: WheelEvent,
  camera: THREE.PerspectiveCamera,
  mouse: THREE.Vector2,
  state: { isDragging: boolean; isCameraAttached: boolean }

): void {
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  if (state.isDragging) {
    state.isCameraAttached = false;

    camera.position.z -= (event.movementY / window.innerHeight) * 10;
  }
}


export function initKeyboardEventListeners(
    keyHash: Record<string, boolean>
  ): void {
    window.addEventListener('keydown', (event) => (keyHash[event.key] = true));
    window.addEventListener('keyup', (event) => (keyHash[event.key] = false));
    
  }