export const GAME_CONFIG = {
  simulation: {
    fixedTimeStep: 1 / 60,
    maxAccumulatedTime: 0.25,
  },

  car: {
    mass: 1,

    acceleration: 22,
    reverseAcceleration: 10,
    brakeDeceleration: 18,
    drag: 2.4,

    maxForwardSpeed: 13,
    maxReverseSpeed: 5,

    turnSpeed: 5.4,
    steeringResponse: 18,
    angularDrag: 16,
    lowSpeedTurnFactor: 0.42,

    lateralGrip: 7.5,
    driftGrip: 1.8,

    boostMultiplier: 2.1,
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