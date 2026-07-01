export const GAME_CONFIG = {
  simulation: {
    fixedTimeStep: 1 / 60,
    maxAccumulatedTime: 0.25,
  },

  car: {
    mass: 1,

    acceleration: 26,
    reverseAcceleration: 12,
    brakeDeceleration: 10,
    drag: 2.1,

    maxForwardSpeed: 15,
    maxReverseSpeed: 5,

    turnSpeed: 6.2,
    steeringResponse: 22,
    angularDrag: 18,
    lowSpeedTurnFactor: 0.58,

    lateralGrip: 8.5,
    driftGrip: 0.85,
    driftTurnMultiplier: 1.55,
    driftSpeedRetention: 0.92,

    boostMultiplier: 2.35,
    boostTurnPenalty: 0.72,
    boostMinSpeed: 5,

    visualLeanAmount: 0.12,
    visualDriftLeanAmount: 0.22,
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