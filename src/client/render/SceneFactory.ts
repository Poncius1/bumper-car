import * as THREE from 'three';
import { createPrototypeGym } from './PrototypeGymFactory';

const SCENE_CONFIG = {
  skyColor: 0xb8f4f2,
} as const;

export interface BumperCarScene {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;

  /**
   * Gameplay root controlled by CarEntity.
   *
   * The imported GLB model is inserted inside this root later.
   */
  readonly localPlayerCar: THREE.Group;
}

export function createBumperCarScene(): BumperCarScene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SCENE_CONFIG.skyColor);

  const camera = createCamera();
  const lights = createLights();
  const gym = createPrototypeGym();
  const localPlayerCar = createLocalPlayerCarRoot();

  scene.add(lights.ambientLight);
  scene.add(lights.directionalLight);
  scene.add(gym.group);
  scene.add(localPlayerCar);

  return {
    scene,
    camera,
    localPlayerCar,
  };
}

function createCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    300,
  );

  camera.position.set(0, 6, 9);
  camera.lookAt(0, 0, 0);

  return camera;
}

function createLights(): {
  readonly ambientLight: THREE.AmbientLight;
  readonly directionalLight: THREE.DirectionalLight;
} {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.35);
  directionalLight.position.set(10, 16, 8);
  directionalLight.castShadow = true;

  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;

  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 80;
  directionalLight.shadow.camera.left = -35;
  directionalLight.shadow.camera.right = 35;
  directionalLight.shadow.camera.top = 35;
  directionalLight.shadow.camera.bottom = -35;

  return {
    ambientLight,
    directionalLight,
  };
}

function createLocalPlayerCarRoot(): THREE.Group {
  const carRoot = new THREE.Group();
  carRoot.name = 'LocalPlayerCar';

  return carRoot;
}