import { GAME_CONFIG } from '../app/GameConfig';

export interface RuntimeCarTuning {
  acceleration: number;
  reverseAcceleration: number;
  brakeDeceleration: number;
  drag: number;
  maxForwardSpeed: number;
  maxReverseSpeed: number;
  turnSpeed: number;
  boostMultiplier: number;
}

export interface RuntimeThirdPersonCameraTuning {
  distance: number;
  height: number;
  lookAtHeight: number;
  positionSmoothing: number;
  lookAtSmoothing: number;
}

export interface RuntimeTopDownCameraTuning {
  height: number;
  lookAtHeight: number;
  positionSmoothing: number;
}

export interface RuntimeIsometricCameraTuning {
  distance: number;
  height: number;
  angleDegrees: number;
  lookAtHeight: number;
  positionSmoothing: number;
  lookAtSmoothing: number;
}

export interface RuntimeStaticArenaCameraTuning {
  positionX: number;
  positionY: number;
  positionZ: number;
  lookAtX: number;
  lookAtY: number;
  lookAtZ: number;
}

export interface RuntimeCameraTuning {
  readonly thirdPerson: RuntimeThirdPersonCameraTuning;
  readonly topDown: RuntimeTopDownCameraTuning;
  readonly isometric: RuntimeIsometricCameraTuning;
  readonly staticArena: RuntimeStaticArenaCameraTuning;
}

export interface RuntimeTuning {
  readonly car: RuntimeCarTuning;
  readonly camera: RuntimeCameraTuning;
}

export function createDefaultRuntimeTuning(): RuntimeTuning {
  return {
    car: {
      acceleration: GAME_CONFIG.car.acceleration,
      reverseAcceleration: GAME_CONFIG.car.reverseAcceleration,
      brakeDeceleration: GAME_CONFIG.car.brakeDeceleration,
      drag: GAME_CONFIG.car.drag,
      maxForwardSpeed: GAME_CONFIG.car.maxForwardSpeed,
      maxReverseSpeed: GAME_CONFIG.car.maxReverseSpeed,
      turnSpeed: GAME_CONFIG.car.turnSpeed,
      boostMultiplier: GAME_CONFIG.car.boostMultiplier,
    },
    camera: {
      thirdPerson: {
        distance: GAME_CONFIG.camera.thirdPerson.distance,
        height: GAME_CONFIG.camera.thirdPerson.height,
        lookAtHeight: GAME_CONFIG.camera.thirdPerson.lookAtHeight,
        positionSmoothing: GAME_CONFIG.camera.thirdPerson.positionSmoothing,
        lookAtSmoothing: GAME_CONFIG.camera.thirdPerson.lookAtSmoothing,
      },
      topDown: {
        height: GAME_CONFIG.camera.topDown.height,
        lookAtHeight: GAME_CONFIG.camera.topDown.lookAtHeight,
        positionSmoothing: GAME_CONFIG.camera.topDown.positionSmoothing,
      },
      isometric: {
        distance: GAME_CONFIG.camera.isometric.distance,
        height: GAME_CONFIG.camera.isometric.height,
        angleDegrees: GAME_CONFIG.camera.isometric.angleDegrees,
        lookAtHeight: GAME_CONFIG.camera.isometric.lookAtHeight,
        positionSmoothing: GAME_CONFIG.camera.isometric.positionSmoothing,
        lookAtSmoothing: GAME_CONFIG.camera.isometric.lookAtSmoothing,
      },
      staticArena: {
        positionX: GAME_CONFIG.camera.staticArena.positionX,
        positionY: GAME_CONFIG.camera.staticArena.positionY,
        positionZ: GAME_CONFIG.camera.staticArena.positionZ,
        lookAtX: GAME_CONFIG.camera.staticArena.lookAtX,
        lookAtY: GAME_CONFIG.camera.staticArena.lookAtY,
        lookAtZ: GAME_CONFIG.camera.staticArena.lookAtZ,
      },
    },
  };
}