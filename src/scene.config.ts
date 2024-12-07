import * as THREE from 'three';

export function createScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  return scene;
}

export function createCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight);
  camera.position.set(0, 100, 100);
  return camera;
}

export function createRenderer(): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  return renderer;
}

export function createLights(): THREE.Light {
  const ambientLight = new THREE.AmbientLight(0xffffff, 3);
 
  return ambientLight;
}

export function createTexture(): THREE.CanvasTexture{
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
return new THREE.CanvasTexture(canvas);

}
