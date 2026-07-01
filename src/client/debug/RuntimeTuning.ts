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

export interface RuntimeCameraTuning {
  distance: number;
  height: number;
  lookAtHeight: number;
  positionSmoothing: number;
  lookAtSmoothing: number;
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
      distance: GAME_CONFIG.camera.distance,
      height: GAME_CONFIG.camera.height,
      lookAtHeight: GAME_CONFIG.camera.lookAtHeight,
      positionSmoothing: GAME_CONFIG.camera.positionSmoothing,
      lookAtSmoothing: GAME_CONFIG.camera.lookAtSmoothing,
    },
  };
}