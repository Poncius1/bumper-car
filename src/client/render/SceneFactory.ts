import * as THREE from 'three';

export interface BumperCarScene {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
}

/**
 * Creates the initial prototype scene.
 *
 * This is intentionally simple:
 * - no gameplay logic
 * - no networking
 * - no physics
 *
 * The goal of this module is to own static scene creation only.
 */
export function createBumperCarScene(): BumperCarScene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x101014);

  const camera = createCamera();
  const lights = createLights();
  const arena = createArena();
  const car = createPlaceholderCar();

  scene.add(lights.ambientLight);
  scene.add(lights.directionalLight);
  scene.add(arena);
  scene.add(car);

  return {
    scene,
    camera,
  };
}

function createCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
  );

  camera.position.set(8, 7, 8);
  camera.lookAt(0, 0, 0);

  return camera;
}

function createLights(): {
  readonly ambientLight: THREE.AmbientLight;
  readonly directionalLight: THREE.DirectionalLight;
} {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.4);
  directionalLight.position.set(6, 10, 4);

  return {
    ambientLight,
    directionalLight,
  };
}

function createArena(): THREE.Group {
  const arena = new THREE.Group();
  arena.name = 'PrototypeArena';

  const floorGeometry = new THREE.BoxGeometry(18, 0.2, 18);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x242433,
    roughness: 0.85,
    metalness: 0.1,
  });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.y = -0.1;
  floor.name = 'ArenaFloor';

  const grid = new THREE.GridHelper(18, 18, 0x6677ff, 0x333344);
  grid.position.y = 0.02;
  grid.name = 'ArenaGrid';

  arena.add(floor);
  arena.add(grid);

  return arena;
}

function createPlaceholderCar(): THREE.Group {
  const car = new THREE.Group();
  car.name = 'LocalPlayerCar';

  const bodyGeometry = new THREE.BoxGeometry(1.6, 0.45, 2.4);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xff4d4d,
    roughness: 0.55,
    metalness: 0.15,
  });

  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.35;
  body.name = 'CarBody';

  const cabinGeometry = new THREE.BoxGeometry(1.1, 0.45, 1);
  const cabinMaterial = new THREE.MeshStandardMaterial({
    color: 0x2f80ff,
    roughness: 0.45,
    metalness: 0.2,
  });

  const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
  cabin.position.set(0, 0.75, -0.25);
  cabin.name = 'CarCabin';

  /**
   * Small front marker so we can clearly see where the car is facing.
   * This will be useful once movement and rotation are added.
   */
  const frontMarkerGeometry = new THREE.BoxGeometry(0.35, 0.2, 0.25);
  const frontMarkerMaterial = new THREE.MeshStandardMaterial({
    color: 0xffff66,
    roughness: 0.4,
  });

  const frontMarker = new THREE.Mesh(frontMarkerGeometry, frontMarkerMaterial);
  frontMarker.position.set(0, 0.55, -1.35);
  frontMarker.name = 'CarFrontMarker';

  car.add(body);
  car.add(cabin);
  car.add(frontMarker);

  return car;
}