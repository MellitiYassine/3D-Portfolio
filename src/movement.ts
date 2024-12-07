import * as THREE from 'three';


export function lerpAngle(a: number, b: number, k: number) {
    if (a - b > Math.PI) b += 2 * Math.PI;
    if (b - a > Math.PI) a += 2 * Math.PI;
  
    return THREE.MathUtils.lerp(a, b, k) % (2 * Math.PI);
  }