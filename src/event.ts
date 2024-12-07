import * as THREE from 'three';
import { MAX_FOV, MIN_FOV, ZOOM_SPEED } from './constants';

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
    onMouseMove(event, camera, mouse, state)
  );
  window.addEventListener('wheel', (event) => onMouseScroll(event, camera));
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

let currentFov: number | null = null;
let animationFrameId: number | null = null;

function onMouseScroll(
  event: WheelEvent,
  camera: THREE.PerspectiveCamera
): void {
  const targetFov =
    camera.fov + (event.deltaY > 0 ? ZOOM_SPEED * 10 : -ZOOM_SPEED * 10);

  const clampedTargetFov = THREE.MathUtils.clamp(targetFov, MIN_FOV, MAX_FOV);

  if (currentFov === null) {
    currentFov = camera.fov;
  }

  function smoothZoom() {
    if (currentFov !== null) {
      currentFov = THREE.MathUtils.lerp(currentFov, clampedTargetFov, ZOOM_SPEED);

      if (Math.abs(currentFov - clampedTargetFov) < 0.01) {
        currentFov = clampedTargetFov;
        animationFrameId = null;
      } else {
        animationFrameId = requestAnimationFrame(smoothZoom);
      }

      camera.fov = currentFov;
      camera.updateProjectionMatrix();
    }
  }

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }

  smoothZoom();
}

export function initKeyboardEventListeners(
  keyHash: Record<string, boolean>
): void {
  window.addEventListener('keydown', (event) => (keyHash[event.key] = true));
  window.addEventListener('keyup', (event) => (keyHash[event.key] = false));
}
