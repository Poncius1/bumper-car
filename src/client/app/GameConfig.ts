export const GAME_CONFIG = {
  simulation: {
    fixedTimeStep: 1 / 60,
    maxAccumulatedTime: 0.25,
  },

  car: {
    acceleration: 12,
    reverseAcceleration: 7,
    brakeDeceleration: 18,
    drag: 5,
    maxForwardSpeed: 7,
    maxReverseSpeed: 3,
    turnSpeed: 2.7,
    boostMultiplier: 1.35,
  },

  camera: {
    distance: 7,
    height: 4.2,
    lookAtHeight: 0.7,
    positionSmoothing: 8,
    lookAtSmoothing: 12,
  },
} as const;