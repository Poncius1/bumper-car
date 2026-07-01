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
    thirdPerson: {
      distance: 7,
      height: 4.2,
      lookAtHeight: 0.7,
      positionSmoothing: 8,
      lookAtSmoothing: 12,
    },

    topDown: {
      height: 20,
      lookAtHeight: 0,
      positionSmoothing: 12,
    },

    isometric: {
      distance: 14,
      height: 10,
      angleDegrees: 45,
      lookAtHeight: 0.5,
      positionSmoothing: 10,
      lookAtSmoothing: 12,
    },

    staticArena: {
      positionX: 0,
      positionY: 28,
      positionZ: 26,
      lookAtX: 0,
      lookAtY: 0,
      lookAtZ: 0,
    },
  },
} as const;