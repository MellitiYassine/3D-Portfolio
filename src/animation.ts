import * as THREE from 'three';


export function floatingAnimation(fbx: THREE.Group<THREE.Object3DEventMap>) {
    const clock = new THREE.Clock();
  
    function animate() {
      const time = clock.getElapsedTime();
      if (fbx) {
        fbx.position.y = 1 + Math.sin(time) * 0.5;
      }
      requestAnimationFrame(animate);
    }
  
    animate();
  }