import * as CANNON from 'cannon-es';
import { GRAVITY } from './constants';

export function createWorldPhysics(): CANNON.World {
  const world = new CANNON.World();
  world.gravity.set(0, GRAVITY, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  (world.solver as CANNON.GSSolver).iterations = 10;
  world.allowSleep = true;
  return world;
}
