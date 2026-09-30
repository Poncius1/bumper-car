import type { CarControllerComponent } from '../components/CarComponents';
import type { MotionComponent } from '../components/MotionComponent';
import type { PlayerInputComponent } from '../components/PlayerInputComponent';
import {
  beginTransformSimulationStep,
  type TransformComponent,
} from '../components/TransformComponent';

import type { EntityId } from '../ecs/Entity';
import type { GameComponents } from '../ecs/GameComponents';

export class CarControllerSystem {
  private readonly components: GameComponents;

  public constructor(components: GameComponents) {
    this.components = components;
  }

  public update(deltaTime: number): void {
    for (
      const [
        entityId,
        controller,
      ] of this.components.carControllers.entries()
    ) {
      this.updateCar(
        entityId,
        controller,
        deltaTime,
      );
    }
  }

  private updateCar(
    entityId: EntityId,
    controller: CarControllerComponent,
    deltaTime: number,
  ): void {
    const transform =
      this.components.transforms.get(entityId);

    const motion =
      this.components.motions.get(entityId);

    const input =
      this.components.playerInputs.get(entityId);

    const state =
      this.components.carStates.get(entityId);

    if (
      transform === undefined ||
      motion === undefined ||
      input === undefined ||
      state === undefined
    ) {
      return;
    }

    beginTransformSimulationStep(transform);

    updateCarState(
      transform,
      motion,
      input,
      state,
    );

    applyThrottle(
      transform,
      motion,
      input,
      controller,
      state.isBoosting,
      deltaTime,
    );

    applyHandbrakeOrDrag(
      transform,
      motion,
      input,
      controller,
      deltaTime,
    );

    clampForwardSpeed(
      transform,
      motion,
      controller,
      state.isBoosting,
    );

    applyLateralGrip(
      transform,
      motion,
      input,
      controller,
      deltaTime,
    );

    updateRotation(
      transform,
      motion,
      input,
      controller,
      state.isDrifting,
      state.isBoosting,
      deltaTime,
    );

    integratePosition(
      transform,
      motion,
      deltaTime,
    );

    transform.yaw =
      normalizeAngle(transform.yaw);

    /*
     * Recalculate slip after movement so debug/gameplay sees
     * the current simulation state rather than the previous step.
     */
    state.slipRatio =
      calculateSlipRatio(
        transform,
        motion,
      );
  }
}

function updateCarState(
  transform: TransformComponent,
  motion: MotionComponent,
  input: PlayerInputComponent,
  state: {
    isDrifting: boolean;
    isBoosting: boolean;
    slipRatio: number;
  },
): void {
  const speed =
    getHorizontalSpeed(motion);

  state.isDrifting =
    speed > 2.5 &&
    input.brake &&
    Math.abs(input.steering) > 0.1;

  state.isBoosting =
    input.boost &&
    input.throttle > 0;

  state.slipRatio =
    calculateSlipRatio(
      transform,
      motion,
    );
}

function applyThrottle(
  transform: TransformComponent,
  motion: MotionComponent,
  input: PlayerInputComponent,
  controller: CarControllerComponent,
  isBoosting: boolean,
  deltaTime: number,
): void {
  const sinYaw =
    Math.sin(transform.yaw);

  const cosYaw =
    Math.cos(transform.yaw);

  const forwardX =
    -sinYaw;

  const forwardZ =
    -cosYaw;

  if (input.throttle > 0) {
    const boostScale =
      isBoosting
        ? controller.boostMultiplier
        : 1;

    const acceleration =
      controller.acceleration *
      boostScale;

    const accelerationStep =
      acceleration *
      deltaTime;

    motion.velocityX +=
      forwardX *
      accelerationStep;

    motion.velocityZ +=
      forwardZ *
      accelerationStep;

    return;
  }

  if (input.throttle < 0) {
    const accelerationStep =
      controller.reverseAcceleration *
      deltaTime;

    motion.velocityX -=
      forwardX *
      accelerationStep;

    motion.velocityZ -=
      forwardZ *
      accelerationStep;
  }
}

function applyHandbrakeOrDrag(
  transform: TransformComponent,
  motion: MotionComponent,
  input: PlayerInputComponent,
  controller: CarControllerComponent,
  deltaTime: number,
): void {
  const forwardX =
    -Math.sin(transform.yaw);

  const forwardZ =
    -Math.cos(transform.yaw);

  const forwardSpeed =
    motion.velocityX * forwardX +
    motion.velocityZ * forwardZ;

  if (input.brake) {
    const targetForwardSpeed =
      forwardSpeed *
      controller.driftSpeedRetention;

    const nextForwardSpeed =
      moveTowards(
        forwardSpeed,
        targetForwardSpeed,
        controller.brakeDeceleration *
          deltaTime,
      );

    const speedDifference =
      nextForwardSpeed -
      forwardSpeed;

    motion.velocityX +=
      forwardX *
      speedDifference;

    motion.velocityZ +=
      forwardZ *
      speedDifference;

    return;
  }

  if (input.throttle !== 0) {
    return;
  }

  const dragFactor =
    Math.max(
      0,
      1 -
        controller.drag *
          deltaTime,
    );

  motion.velocityX *=
    dragFactor;

  motion.velocityZ *=
    dragFactor;
}

function clampForwardSpeed(
  transform: TransformComponent,
  motion: MotionComponent,
  controller: CarControllerComponent,
  isBoosting: boolean,
): void {
  const forwardX =
    -Math.sin(transform.yaw);

  const forwardZ =
    -Math.cos(transform.yaw);

  const forwardSpeed =
    motion.velocityX * forwardX +
    motion.velocityZ * forwardZ;

  const maxForwardSpeed =
    isBoosting
      ? Math.max(
          controller.maxForwardSpeed *
            controller.boostMultiplier,
          controller.boostMinSpeed,
        )
      : controller.maxForwardSpeed;

  if (
    forwardSpeed >
    maxForwardSpeed
  ) {
    const difference =
      maxForwardSpeed -
      forwardSpeed;

    motion.velocityX +=
      forwardX *
      difference;

    motion.velocityZ +=
      forwardZ *
      difference;

    return;
  }

  if (
    forwardSpeed <
    -controller.maxReverseSpeed
  ) {
    const difference =
      -controller.maxReverseSpeed -
      forwardSpeed;

    motion.velocityX +=
      forwardX *
      difference;

    motion.velocityZ +=
      forwardZ *
      difference;
  }

  if (
    isBoosting &&
    forwardSpeed <
      controller.boostMinSpeed
  ) {
    const difference =
      controller.boostMinSpeed -
      forwardSpeed;

    motion.velocityX +=
      forwardX *
      difference;

    motion.velocityZ +=
      forwardZ *
      difference;
  }
}

function applyLateralGrip(
  transform: TransformComponent,
  motion: MotionComponent,
  input: PlayerInputComponent,
  controller: CarControllerComponent,
  deltaTime: number,
): void {
  const rightX =
    Math.cos(transform.yaw);

  const rightZ =
    -Math.sin(transform.yaw);

  const lateralSpeed =
    motion.velocityX * rightX +
    motion.velocityZ * rightZ;

  const grip =
    input.brake
      ? controller.driftGrip
      : controller.lateralGrip;

  const correction =
    clamp(
      grip * deltaTime,
      0,
      1,
    );

  motion.velocityX +=
    rightX *
    -lateralSpeed *
    correction;

  motion.velocityZ +=
    rightZ *
    -lateralSpeed *
    correction;
}

function updateRotation(
  transform: TransformComponent,
  motion: MotionComponent,
  input: PlayerInputComponent,
  controller: CarControllerComponent,
  isDrifting: boolean,
  isBoosting: boolean,
  deltaTime: number,
): void {
  const forwardSpeed =
    getForwardSpeed(
      transform,
      motion,
    );

  const speed =
    getHorizontalSpeed(motion);

  const speedRatio =
    clamp(
      speed /
        Math.max(
          controller.maxForwardSpeed,
          0.001,
        ),
      0,
      1,
    );

  const turnControl =
    controller.lowSpeedTurnFactor +
    (
      1 -
      controller.lowSpeedTurnFactor
    ) *
      speedRatio;

  const reverseDirection =
    forwardSpeed >= 0
      ? 1
      : -1;

  const driftScale =
    isDrifting
      ? controller.driftTurnMultiplier
      : 1;

  const boostScale =
    isBoosting
      ? controller.boostTurnPenalty
      : 1;

  const targetAngularVelocity =
    -input.steering *
    reverseDirection *
    controller.turnSpeed *
    turnControl *
    driftScale *
    boostScale;

  motion.angularVelocity =
    moveTowards(
      motion.angularVelocity,
      targetAngularVelocity,
      controller.steeringResponse *
        deltaTime,
    );

  if (input.steering === 0) {
    motion.angularVelocity =
      moveTowards(
        motion.angularVelocity,
        0,
        controller.angularDrag *
          deltaTime,
      );
  }

  transform.yaw +=
    motion.angularVelocity *
    deltaTime;
}

function integratePosition(
  transform: TransformComponent,
  motion: MotionComponent,
  deltaTime: number,
): void {
  transform.positionX +=
    motion.velocityX *
    deltaTime;

  transform.positionY +=
    motion.velocityY *
    deltaTime;

  transform.positionZ +=
    motion.velocityZ *
    deltaTime;

  /*
   * Temporary ground-plane restriction.
   *
   * Rapier will own vertical physics later.
   */
  transform.positionY = 0;
  motion.velocityY = 0;
}

function getHorizontalSpeed(
  motion: MotionComponent,
): number {
  return Math.hypot(
    motion.velocityX,
    motion.velocityZ,
  );
}

function getForwardSpeed(
  transform: TransformComponent,
  motion: MotionComponent,
): number {
  const forwardX =
    -Math.sin(transform.yaw);

  const forwardZ =
    -Math.cos(transform.yaw);

  return (
    motion.velocityX *
      forwardX +
    motion.velocityZ *
      forwardZ
  );
}

function calculateSlipRatio(
  transform: TransformComponent,
  motion: MotionComponent,
): number {
  const rightX =
    Math.cos(transform.yaw);

  const rightZ =
    -Math.sin(transform.yaw);

  const lateralSpeed =
    Math.abs(
      motion.velocityX *
        rightX +
      motion.velocityZ *
        rightZ,
    );

  const totalSpeed =
    Math.max(
      getHorizontalSpeed(motion),
      0.001,
    );

  return clamp(
    lateralSpeed /
      totalSpeed,
    0,
    1,
  );
}

function moveTowards(
  current: number,
  target: number,
  maxDelta: number,
): number {
  if (
    Math.abs(
      target -
        current,
    ) <= maxDelta
  ) {
    return target;
  }

  return (
    current +
    Math.sign(
      target -
        current,
    ) *
      maxDelta
  );
}

function clamp(
  value: number,
  min: number,
  max: number,
): number {
  return Math.min(
    Math.max(
      value,
      min,
    ),
    max,
  );
}

function normalizeAngle(
  angle: number,
): number {
  return Math.atan2(
    Math.sin(angle),
    Math.cos(angle),
  );
}