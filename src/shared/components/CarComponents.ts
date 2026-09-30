export interface CarControllerComponent {
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
}

export interface CarStateComponent {
  isDrifting: boolean;
  isBoosting: boolean;

  slipRatio: number;
}

export interface CarControllerDefaults {
  readonly acceleration: number;
  readonly reverseAcceleration: number;
  readonly brakeDeceleration: number;
  readonly drag: number;

  readonly maxForwardSpeed: number;
  readonly maxReverseSpeed: number;

  readonly turnSpeed: number;
  readonly steeringResponse: number;
  readonly angularDrag: number;
  readonly lowSpeedTurnFactor: number;

  readonly lateralGrip: number;

  readonly driftGrip: number;
  readonly driftTurnMultiplier: number;
  readonly driftSpeedRetention: number;

  readonly boostMultiplier: number;
  readonly boostTurnPenalty: number;
  readonly boostMinSpeed: number;
}

export function createCarControllerComponent(
  defaults: CarControllerDefaults,
): CarControllerComponent {
  return {
    acceleration: defaults.acceleration,
    reverseAcceleration: defaults.reverseAcceleration,
    brakeDeceleration: defaults.brakeDeceleration,
    drag: defaults.drag,

    maxForwardSpeed: defaults.maxForwardSpeed,
    maxReverseSpeed: defaults.maxReverseSpeed,

    turnSpeed: defaults.turnSpeed,
    steeringResponse: defaults.steeringResponse,
    angularDrag: defaults.angularDrag,
    lowSpeedTurnFactor: defaults.lowSpeedTurnFactor,

    lateralGrip: defaults.lateralGrip,

    driftGrip: defaults.driftGrip,
    driftTurnMultiplier: defaults.driftTurnMultiplier,
    driftSpeedRetention: defaults.driftSpeedRetention,

    boostMultiplier: defaults.boostMultiplier,
    boostTurnPenalty: defaults.boostTurnPenalty,
    boostMinSpeed: defaults.boostMinSpeed,
  };
}

export function createCarStateComponent(): CarStateComponent {
  return {
    isDrifting: false,
    isBoosting: false,
    slipRatio: 0,
  };
}