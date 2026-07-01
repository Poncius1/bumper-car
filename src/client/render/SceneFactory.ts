import * as THREE from 'three';

const PROTOTYPE_GYM_CONFIG = {
  skyColor: 0xB8FDFF,
  floorColor: 0xffffff,
  floorSize: 100,
} as const;

export interface BumperCarScene {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly localPlayerCar: THREE.Group;
}

/**
 * Creates the prototype gym scene.
 *
 * The gym is a clean testing environment for:
 * - car movement
 * - camera feel
 * - future collision testing
 * - future multiplayer spawning
 *
 * It intentionally avoids complex art direction so gameplay feel is easier to evaluate.
 */
export function createBumperCarScene(): BumperCarScene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PROTOTYPE_GYM_CONFIG.skyColor);

  const camera = createCamera();
  const lights = createLights();
  const gym = createPrototypeGym();
  const localPlayerCar = createPlaceholderCar();

  scene.add(lights.ambientLight);
  scene.add(lights.directionalLight);
  scene.add(gym);
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
    200,
  );

  camera.position.set(0, 6, 9);
  camera.lookAt(0, 0, 0);

  return camera;
}

function createLights(): {
  readonly ambientLight: THREE.AmbientLight;
  readonly directionalLight: THREE.DirectionalLight;
} {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.25);
  directionalLight.position.set(5, 10, 6);

  return {
    ambientLight,
    directionalLight,
  };
}

function createPrototypeGym(): THREE.Group {
  const gym = new THREE.Group();
  gym.name = 'PrototypeGym';

  const floor = createGymFloor();
  const centerMarker = createCenterMarker();
  const spawnMarker = createSpawnMarker();

  gym.add(floor);
  gym.add(centerMarker);
  gym.add(spawnMarker);

  return gym;
}

function createGymFloor(): THREE.Mesh {
  const floorGeometry = new THREE.PlaneGeometry(
    PROTOTYPE_GYM_CONFIG.floorSize,
    PROTOTYPE_GYM_CONFIG.floorSize,
  );

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: PROTOTYPE_GYM_CONFIG.floorColor,
    roughness: 0.9,
    metalness: 0,
  });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);

  /**
   * PlaneGeometry is vertical by default.
   * We rotate it so it becomes the ground plane on XZ.
   */
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.name = 'GymFloor';

  return floor;
}

function createCenterMarker(): THREE.Mesh {
  const markerGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.025, 48);
  const markerMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8e8df,
    roughness: 0.85,
    metalness: 0,
  });

  const marker = new THREE.Mesh(markerGeometry, markerMaterial);
  marker.position.y = 0.025;
  marker.name = 'GymCenterMarker';

  return marker;
}

function createSpawnMarker(): THREE.Group {
  const marker = new THREE.Group();
  marker.name = 'LocalPlayerSpawnMarker';

  const lineMaterial = new THREE.MeshStandardMaterial({
    color: 0x5f7cff,
    roughness: 0.7,
    metalness: 0,
  });

  const forwardLine = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.03, 2),
    lineMaterial,
  );
  forwardLine.position.set(0, 0.04, -1);
  forwardLine.name = 'SpawnForwardLine';

  const sideLine = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.03, 0.12),
    lineMaterial,
  );
  sideLine.position.set(0, 0.04, 0);
  sideLine.name = 'SpawnSideLine';

  marker.add(forwardLine);
  marker.add(sideLine);

  return marker;
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
   * This will be useful while tuning movement and camera behavior.
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