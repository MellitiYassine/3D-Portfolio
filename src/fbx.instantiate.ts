import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';
import { floatingAnimation } from './animation';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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

export async function loadNameModel(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  camera: THREE.Camera
) {
  const loader = new GLTFLoader();

  const loadModel = (url: string) => {
    return new Promise<THREE.Group>((resolve, reject) => {
      loader.load(
        url,
        (glb) => resolve(glb.scene),
        undefined,
        (error) => reject(error)
      );
    });
  };

  try {
    const glb = await loadModel('models/name.glb');

    glb.position.set(5, 0, 0);
    glb.scale.set(3, 3, 3);
    glb.rotation.set(-Math.PI / 12, 0, 0);

    glb.castShadow = true;
    glb.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    scene.add(glb);
    renderer.render(scene, camera);
  } catch (error) {
    console.error('Failed to load and animate the model:', error);
  }
}

export async function loadEducationModel(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  camera: THREE.Camera
) {
  const loader = new GLTFLoader();

  const loadModel = (url: string) => {
    return new Promise<THREE.Group>((resolve, reject) => {
      loader.load(
        url,
        (glb) => resolve(glb.scene),
        undefined,
        (error) => reject(error)
      );
    });
  };

  try {
    const glb = await loadModel('models/education.glb');

    glb.position.set(-8, 4, 2);
    glb.scale.set(3, 3, 3);
    glb.rotation.set(Math.PI / 2, 0, 0);

    glb.castShadow = true;
    glb.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    scene.add(glb);
    renderer.render(scene, camera);
  } catch (error) {
    console.error('Failed to load and animate the model:', error);
  }
}

export async function loadJobModel(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  camera: THREE.Camera
) {
  const loader = new GLTFLoader();

  const loadModel = (url: string) => {
    return new Promise<THREE.Group>((resolve, reject) => {
      loader.load(
        url,
        (glb) => resolve(glb.scene),
        undefined,
        (error) => reject(error)
      );
    });
  };

  try {
    const glb = await loadModel('models/job.glb');

    glb.position.set(15, 0, 2);
    glb.scale.set(1, 1, 1);
    glb.rotation.set(-Math.PI / 2.5, 0, 0);

    glb.castShadow = true;
    glb.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    scene.add(glb);
    renderer.render(scene, camera);
  } catch (error) {
    console.error('Failed to load and animate the model:', error);
  }
}
