import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';
import { floatingAnimation } from './animation';

type Transform = {
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
};

function loadFBXModel(
  filePath: string,
  transform?: Transform,
  scene?: THREE.Scene
): Promise<THREE.Group> {
  const loader = new FBXLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      filePath,
      (fbx) => {
        if (transform?.position) {
          const [x, y, z] = transform.position;
          fbx.position.set(x, y, z);
        }

        if (transform?.scale) {
          const [x, y, z] = transform.scale;
          fbx.scale.set(x, y, z);
        }
        if (transform?.rotation) {
          const [x, y, z] = transform.rotation;
          fbx.rotation.set(x, y, z);
        }

        if (scene) {
          scene.add(fbx);
        }

        resolve(fbx);
      },
      (xhr) => {
        console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.error('An error occurred while loading the FBX model:', error);
        reject(error);
      }
    );
  });
}

export async function loadAndAnimateAngularModel(
  scene: THREE.Scene,
  renderer: THREE.Renderer,
  camera: THREE.Camera
) {
  try {
    const fbx = await loadFBXModel('models/angular.fbx', {
      position: [3, 3, 3],
      scale: [0.005, 0.005, 0.005],
      rotation: [0, -Math.PI / 2, 0],
    });
    scene.add(fbx);
    floatingAnimation(fbx);
    renderer.render(scene, camera);
  } catch (error) {
    console.error('Failed to load and animate the model:', error);
  }
}

export async function loadAndAnimateSpringModel(
    scene: THREE.Scene,
    renderer: THREE.Renderer,
    camera: THREE.Camera
  ) {
    try {
      const fbx = await loadFBXModel('models/java.fbx', {
        position: [5, 5, 3],
        scale: [0.1, 0.1, 0.1],
        rotation: [0, 0, 0],
      });
      scene.add(fbx);
      floatingAnimation(fbx);
      renderer.render(scene, camera);
    } catch (error) {
      console.error('Failed to load and animate the model:', error);
    }
  }
  


