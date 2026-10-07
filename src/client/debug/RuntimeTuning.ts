import { GAME_CONFIG } from '../app/GameConfig';

export interface RuntimeCarTuning {
  mass: number;

  acceleration: number;
  reverseAcceleration: number;
  brakeDeceleration: number;
  drag: number;

  maxForwardSpeed: number;
  maxReverseSpeed: number;

  turnSpeed: number;
  steeringResponse: number;
  angularDrag: number;
  lowSpeedTurnFactor: number;

  lateralGrip: number;
  driftGrip: number;
  driftTurnMultiplier: number;
  driftSpeedRetention: number;

  boostMultiplier: number;
  boostTurnPenalty: number;
  boostMinSpeed: number;

  visualLeanAmount: number;
  visualDriftLeanAmount: number;
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
  
}

export interface RuntimeTuning {
  readonly car: RuntimeCarTuning;
  readonly camera: RuntimeCameraTuning;
}

export function createDefaultRuntimeTuning(): RuntimeTuning {
  return {
    car: {
      mass: GAME_CONFIG.car.mass,

      acceleration: GAME_CONFIG.car.acceleration,
      reverseAcceleration: GAME_CONFIG.car.reverseAcceleration,
      brakeDeceleration: GAME_CONFIG.car.brakeDeceleration,
      drag: GAME_CONFIG.car.drag,

      maxForwardSpeed: GAME_CONFIG.car.maxForwardSpeed,
      maxReverseSpeed: GAME_CONFIG.car.maxReverseSpeed,

      turnSpeed: GAME_CONFIG.car.turnSpeed,
      steeringResponse: GAME_CONFIG.car.steeringResponse,
      angularDrag: GAME_CONFIG.car.angularDrag,
      lowSpeedTurnFactor: GAME_CONFIG.car.lowSpeedTurnFactor,

      lateralGrip: GAME_CONFIG.car.lateralGrip,
      driftGrip: GAME_CONFIG.car.driftGrip,
      driftTurnMultiplier: GAME_CONFIG.car.driftTurnMultiplier,
      driftSpeedRetention: GAME_CONFIG.car.driftSpeedRetention,

      boostMultiplier: GAME_CONFIG.car.boostMultiplier,
      boostTurnPenalty: GAME_CONFIG.car.boostTurnPenalty,
      boostMinSpeed: GAME_CONFIG.car.boostMinSpeed,

      visualLeanAmount: GAME_CONFIG.car.visualLeanAmount,
      visualDriftLeanAmount: GAME_CONFIG.car.visualDriftLeanAmount,
    },

    camera: {
      thirdPerson: {
        distance: GAME_CONFIG.camera.thirdPerson.distance,
        height: GAME_CONFIG.camera.thirdPerson.height,
        lookAtHeight: GAME_CONFIG.camera.thirdPerson.lookAtHeight,
        positionSmoothing: GAME_CONFIG.camera.thirdPerson.positionSmoothing,
        lookAtSmoothing: GAME_CONFIG.camera.thirdPerson.lookAtSmoothing,
      },
      
    },
  };
}