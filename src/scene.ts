import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export function createScene(worldPhysics: CANNON.World): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const backgroundPlane = createBackgroundPlane(worldPhysics);
  scene.add(backgroundPlane);
  return scene;
}

export function createBackgroundPlane(worldPhysics: CANNON.World): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(10000, 10000);
  const material = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const plane = new THREE.Mesh(geometry, material);

  plane.receiveShadow = true;
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0;

  const shape = new CANNON.Plane();
  const planeBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(plane.position.x, plane.position.y, plane.position.z),
    quaternion: new CANNON.Quaternion().setFromEuler(plane.rotation.x, plane.rotation.y, plane.rotation.z) // Align rotation with THREE.js mesh
  });

  planeBody.addShape(shape);

  worldPhysics.addBody(planeBody);

  return plane;
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
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}

export function createLights(): THREE.Light[] {
  const directionalLight = new THREE.DirectionalLight(0xffffff, 4);

  directionalLight.position.set(1, 10, 1);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.left = -50;
  directionalLight.shadow.camera.right = 50;
  directionalLight.shadow.camera.top = 50;
  directionalLight.shadow.camera.bottom = -50;

  directionalLight.rotation.y = Math.PI / 4;

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  const target = new THREE.Object3D();
  target.position.set(0, 0, 0);
  directionalLight.target = target;

  return [directionalLight, ambientLight];
}

// export function createTexture(): THREE.CanvasTexture {
//   const canvas = document.createElement('canvas');
//   const context = canvas.getContext('2d')!;
//   const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
//   gradient.addColorStop(0.2, '#de4913');
//   gradient.addColorStop(0.4, '#db5318');
//   gradient.addColorStop(0.6, '#d95218');
//   gradient.addColorStop(0.8, '#e36732');
//   gradient.addColorStop(1, '#f57d49');
//   context.fillStyle = gradient;
//   context.fillRect(0, 0, canvas.width, canvas.height);
//   return new THREE.CanvasTexture(canvas);
// }
