import * as THREE from 'three';

const GYM_CONFIG = {
  floorSize: 160,
  playableAreaSize: 90,

  floorColor: 0xc8c8c8,
  boundaryColor: 0x9ca3af,
  obstacleColor: 0x475569,
  dummyColor: 0xf97316,
  boostLaneColor: 0x38bdf8,
  brakeZoneColor: 0xfacc15,
  spawnMarkerColor: 0x5f7cff,
} as const;

export interface PrototypeGym {
  readonly group: THREE.Group;
}

/**
 * Creates a larger gameplay testing gym.
 *
 * The goal is to keep enough empty space for tuning:
 * - acceleration
 * - braking
 * - boost
 * - drift
 * - camera modes
 * - future collision tests
 */
export function createPrototypeGym(): PrototypeGym {
  const group = new THREE.Group();
  group.name = 'PrototypeGym';

  group.add(createFloor());
  group.add(createPlayableAreaFrame());
  group.add(createSpawnMarker());
  group.add(createCenterMarker());
  group.add(createBoostLane());
  group.add(createBrakeTestZone());
  group.add(createSlalomObstacles());
  group.add(createCrashDummies());

  return {
    group,
  };
}

function createFloor(): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(
    GYM_CONFIG.floorSize,
    GYM_CONFIG.floorSize,
  );

  const material = new THREE.MeshStandardMaterial({
    color: GYM_CONFIG.floorColor,
    roughness: 0.92,
    metalness: 0,
  });

  const floor = new THREE.Mesh(geometry, material);
  floor.name = 'GymFloor';
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;

  return floor;
}

function createPlayableAreaFrame(): THREE.Group {
  const frame = new THREE.Group();
  frame.name = 'PlayableAreaFrame';

  const size = GYM_CONFIG.playableAreaSize;
  const halfSize = size / 2;
  const wallThickness = 0.25;
  const wallHeight = 0.18;

  const material = new THREE.MeshStandardMaterial({
    color: GYM_CONFIG.boundaryColor,
    roughness: 0.8,
    metalness: 0,
  });

  const north = createBox({
    name: 'NorthBoundary',
    width: size,
    height: wallHeight,
    depth: wallThickness,
    material,
  });
  north.position.set(0, wallHeight / 2, -halfSize);

  const south = createBox({
    name: 'SouthBoundary',
    width: size,
    height: wallHeight,
    depth: wallThickness,
    material,
  });
  south.position.set(0, wallHeight / 2, halfSize);

  const east = createBox({
    name: 'EastBoundary',
    width: wallThickness,
    height: wallHeight,
    depth: size,
    material,
  });
  east.position.set(halfSize, wallHeight / 2, 0);

  const west = createBox({
    name: 'WestBoundary',
    width: wallThickness,
    height: wallHeight,
    depth: size,
    material,
  });
  west.position.set(-halfSize, wallHeight / 2, 0);

  frame.add(north, south, east, west);

  return frame;
}

function createSpawnMarker(): THREE.Group {
  const marker = new THREE.Group();
  marker.name = 'LocalPlayerSpawnMarker';

  const material = new THREE.MeshStandardMaterial({
    color: GYM_CONFIG.spawnMarkerColor,
    roughness: 0.7,
    metalness: 0,
  });

  const forwardLine = createBox({
    name: 'SpawnForwardLine',
    width: 0.15,
    height: 0.03,
    depth: 4,
    material,
  });
  forwardLine.position.set(0, 0.035, -2);

  const sideLine = createBox({
    name: 'SpawnSideLine',
    width: 2,
    height: 0.03,
    depth: 0.15,
    material,
  });
  sideLine.position.set(0, 0.035, 0);

  marker.add(forwardLine, sideLine);

  return marker;
}

function createCenterMarker(): THREE.Mesh {
  const geometry = new THREE.CylinderGeometry(2, 2, 0.025, 64);

  const material = new THREE.MeshStandardMaterial({
    color: 0xb8b8b8,
    roughness: 0.85,
    metalness: 0,
  });

  const marker = new THREE.Mesh(geometry, material);
  marker.name = 'GymCenterMarker';
  marker.position.y = 0.025;
  marker.receiveShadow = true;

  return marker;
}

function createBoostLane(): THREE.Group {
  const lane = new THREE.Group();
  lane.name = 'BoostLaneTest';

  const material = new THREE.MeshStandardMaterial({
    color: GYM_CONFIG.boostLaneColor,
    roughness: 0.75,
    metalness: 0,
  });

  const laneSurface = createBox({
    name: 'BoostLaneSurface',
    width: 5,
    height: 0.025,
    depth: 28,
    material,
  });
  laneSurface.position.set(-28, 0.025, 0);

  const startMarker = createBox({
    name: 'BoostLaneStartMarker',
    width: 5.2,
    height: 0.05,
    depth: 0.35,
    material,
  });
  startMarker.position.set(-28, 0.055, 14);

  const endMarker = createBox({
    name: 'BoostLaneEndMarker',
    width: 5.2,
    height: 0.05,
    depth: 0.35,
    material,
  });
  endMarker.position.set(-28, 0.055, -14);

  lane.add(laneSurface, startMarker, endMarker);

  return lane;
}

function createBrakeTestZone(): THREE.Group {
  const zone = new THREE.Group();
  zone.name = 'BrakeAndDriftTestZone';

  const material = new THREE.MeshStandardMaterial({
    color: GYM_CONFIG.brakeZoneColor,
    roughness: 0.8,
    metalness: 0,
  });

  const surface = createBox({
    name: 'BrakeZoneSurface',
    width: 20,
    height: 0.025,
    depth: 8,
    material,
  });
  surface.position.set(24, 0.025, 24);

  const leftMarker = createBox({
    name: 'BrakeZoneLeftMarker',
    width: 0.25,
    height: 0.05,
    depth: 8,
    material,
  });
  leftMarker.position.set(14, 0.055, 24);

  const rightMarker = createBox({
    name: 'BrakeZoneRightMarker',
    width: 0.25,
    height: 0.05,
    depth: 8,
    material,
  });
  rightMarker.position.set(34, 0.055, 24);

  zone.add(surface, leftMarker, rightMarker);

  return zone;
}

function createSlalomObstacles(): THREE.Group {
  const slalom = new THREE.Group();
  slalom.name = 'SlalomObstacleTest';

  const material = new THREE.MeshStandardMaterial({
    color: GYM_CONFIG.obstacleColor,
    roughness: 0.8,
    metalness: 0,
  });

  const positions = [
    new THREE.Vector3(18, 0, -30),
    new THREE.Vector3(26, 0, -24),
    new THREE.Vector3(18, 0, -18),
    new THREE.Vector3(26, 0, -12),
    new THREE.Vector3(18, 0, -6),
  ];

  for (let index = 0; index < positions.length; index += 1) {
    const obstacle = createBox({
      name: `SlalomBlock_${index + 1}`,
      width: 1.6,
      height: 1.6,
      depth: 1.6,
      material,
    });

    obstacle.position.copy(positions[index]);
    obstacle.position.y = 0.8;

    slalom.add(obstacle);
  }

  return slalom;
}

function createCrashDummies(): THREE.Group {
  const dummies = new THREE.Group();
  dummies.name = 'CrashDummyTest';

  const positions = [
    new THREE.Vector3(-18, 0, -28),
    new THREE.Vector3(-8, 0, -32),
    new THREE.Vector3(2, 0, -28),
    new THREE.Vector3(-18, 0, 24),
    new THREE.Vector3(-8, 0, 30),
    new THREE.Vector3(2, 0, 24),
  ];

  for (let index = 0; index < positions.length; index += 1) {
    const dummy = createCrashDummy(`CrashDummy_${index + 1}`);
    dummy.position.copy(positions[index]);

    dummies.add(dummy);
  }

  return dummies;
}

function createCrashDummy(name: string): THREE.Group {
  const dummy = new THREE.Group();
  dummy.name = name;

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: GYM_CONFIG.dummyColor,
    roughness: 0.65,
    metalness: 0.05,
  });

  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.75,
    metalness: 0.05,
  });

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.65, 0.25, 24),
    baseMaterial,
  );
  base.name = `${name}_Base`;
  base.position.y = 0.125;
  base.castShadow = true;
  base.receiveShadow = true;

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.48, 1.1, 24),
    bodyMaterial,
  );
  body.name = `${name}_Body`;
  body.position.y = 0.8;
  body.castShadow = true;
  body.receiveShadow = true;

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 24, 16),
    bodyMaterial,
  );
  head.name = `${name}_Head`;
  head.position.y = 1.5;
  head.castShadow = true;
  head.receiveShadow = true;

  dummy.add(base, body, head);

  return dummy;
}

interface BoxOptions {
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly material: THREE.Material;
}

function createBox(options: BoxOptions): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(
    options.width,
    options.height,
    options.depth,
  );

  const mesh = new THREE.Mesh(geometry, options.material);
  mesh.name = options.name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}