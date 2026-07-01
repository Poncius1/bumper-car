import * as THREE from 'three';
import type { CarInputCommand } from '../../input/CarInputCommand';
import type { CarEntity } from '../entities/CarEntity';

export interface CarMovementConfig {
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

const TEMP_FORWARD = new THREE.Vector3();
const TEMP_RIGHT = new THREE.Vector3();

export class CarMovementSystem {
  private readonly config: CarMovementConfig;

  public constructor(config: CarMovementConfig) {
    this.config = config;
  }

  public update(car: CarEntity, input: CarInputCommand, deltaTime: number): void {
    car.beginSimulationStep();
    car.mass = this.config.mass;

    this.updateStateFlags(car, input);
    this.applyThrottle(car, input, deltaTime);
    this.applyHandbrakeOrDrag(car, input, deltaTime);
    this.clampForwardSpeed(car);
    this.applyLateralGrip(car, input, deltaTime);
    this.updateRotation(car, input, deltaTime);
    this.applyVisualLean(car, input, deltaTime);
    this.integratePosition(car, deltaTime);

    car.yaw = normalizeAngle(car.yaw);
  }

  private updateStateFlags(car: CarEntity, input: CarInputCommand): void {
    const enoughSpeedToDrift = car.speed > 2.5;
    const steeringWhileBraking = Math.abs(input.steering) > 0.1 && input.brake;

    car.isDrifting = enoughSpeedToDrift && steeringWhileBraking;
    car.isBoosting = input.boost && input.throttle > 0;

    const lateral = Math.abs(car.lateralSpeed);
    const total = Math.max(car.speed, 0.001);

    car.slipRatio = clamp(lateral / total, 0, 1);
  }

  private applyThrottle(
    car: CarEntity,
    input: CarInputCommand,
    deltaTime: number,
  ): void {
    const forward = getForwardVector(car.yaw, TEMP_FORWARD);

    if (input.throttle > 0) {
      const boostScale = car.isBoosting ? this.config.boostMultiplier : 1;
      const acceleration = this.config.acceleration * boostScale;

      car.velocity.addScaledVector(forward, acceleration * deltaTime);
      return;
    }

    if (input.throttle < 0) {
      car.velocity.addScaledVector(
        forward,
        -this.config.reverseAcceleration * deltaTime,
      );
    }
  }

  private applyHandbrakeOrDrag(
    car: CarEntity,
    input: CarInputCommand,
    deltaTime: number,
  ): void {
    const forward = getForwardVector(car.yaw, TEMP_FORWARD);
    const forwardSpeed = car.velocity.dot(forward);

    if (input.brake) {
      /**
       * Handbrake should not kill all momentum instantly.
       * It reduces forward speed but keeps enough energy to drift.
       */
      const targetForwardSpeed = forwardSpeed * this.config.driftSpeedRetention;

      const nextForwardSpeed = moveTowards(
        forwardSpeed,
        targetForwardSpeed,
        this.config.brakeDeceleration * deltaTime,
      );

      car.velocity.addScaledVector(forward, nextForwardSpeed - forwardSpeed);
      return;
    }

    if (input.throttle !== 0) {
      return;
    }

    const dragFactor = Math.max(0, 1 - this.config.drag * deltaTime);

    car.velocity.x *= dragFactor;
    car.velocity.z *= dragFactor;
  }

  private clampForwardSpeed(car: CarEntity): void {
    const forward = getForwardVector(car.yaw, TEMP_FORWARD);
    const forwardSpeed = car.velocity.dot(forward);

    const maxForwardSpeed = car.isBoosting
      ? Math.max(
          this.config.maxForwardSpeed * this.config.boostMultiplier,
          this.config.boostMinSpeed,
        )
      : this.config.maxForwardSpeed;

    if (forwardSpeed > maxForwardSpeed) {
      car.velocity.addScaledVector(forward, maxForwardSpeed - forwardSpeed);
      return;
    }

    if (forwardSpeed < -this.config.maxReverseSpeed) {
      car.velocity.addScaledVector(
        forward,
        -this.config.maxReverseSpeed - forwardSpeed,
      );
    }

    if (car.isBoosting && forwardSpeed < this.config.boostMinSpeed) {
      car.velocity.addScaledVector(
        forward,
        this.config.boostMinSpeed - forwardSpeed,
      );
    }
  }

  private applyLateralGrip(
    car: CarEntity,
    input: CarInputCommand,
    deltaTime: number,
  ): void {
    const right = getRightVector(car.yaw, TEMP_RIGHT);
    const lateralSpeed = car.velocity.dot(right);

    const grip = input.brake ? this.config.driftGrip : this.config.lateralGrip;
    const correction = clamp(grip * deltaTime, 0, 1);

    car.velocity.addScaledVector(right, -lateralSpeed * correction);
  }

  private updateRotation(
    car: CarEntity,
    input: CarInputCommand,
    deltaTime: number,
  ): void {
    const forwardSpeed = car.forwardSpeed;
    const speedRatio = clamp(
      car.speed / Math.max(this.config.maxForwardSpeed, 0.001),
      0,
      1,
    );

    const turnControl =
      this.config.lowSpeedTurnFactor +
      (1 - this.config.lowSpeedTurnFactor) * speedRatio;

    const reverseDirection = forwardSpeed >= 0 ? 1 : -1;

    const driftScale = car.isDrifting ? this.config.driftTurnMultiplier : 1;
    const boostScale = car.isBoosting ? this.config.boostTurnPenalty : 1;

    const targetAngularVelocity =
      -input.steering *
      reverseDirection *
      this.config.turnSpeed *
      turnControl *
      driftScale *
      boostScale;

    car.angularVelocity = moveTowards(
      car.angularVelocity,
      targetAngularVelocity,
      this.config.steeringResponse * deltaTime,
    );

    if (input.steering === 0) {
      car.angularVelocity = moveTowards(
        car.angularVelocity,
        0,
        this.config.angularDrag * deltaTime,
      );
    }

    car.yaw += car.angularVelocity * deltaTime;
  }

  private applyVisualLean(
    car: CarEntity,
    input: CarInputCommand,
    deltaTime: number,
  ): void {
    const leanAmount = car.isDrifting
      ? this.config.visualDriftLeanAmount
      : this.config.visualLeanAmount;

    const targetRoll = -input.steering * leanAmount;
    const targetPitch = car.isBoosting ? -0.08 : 0;

    const alpha = 1 - Math.exp(-12 * deltaTime);

    car.visualRoll = lerp(car.visualRoll, targetRoll, alpha);
    car.visualPitch = lerp(car.visualPitch, targetPitch, alpha);
  }

  private integratePosition(car: CarEntity, deltaTime: number): void {
    car.position.addScaledVector(car.velocity, deltaTime);
    car.position.y = 0;
  }
}

function getForwardVector(yaw: number, target: THREE.Vector3): THREE.Vector3 {
  return target.set(-Math.sin(yaw), 0, -Math.cos(yaw));
}

function getRightVector(yaw: number, target: THREE.Vector3): THREE.Vector3 {
  return target.set(Math.cos(yaw), 0, -Math.sin(yaw));
}

function moveTowards(current: number, target: number, maxDelta: number): number {
  if (Math.abs(target - current) <= maxDelta) {
    return target;
  }

  return current + Math.sign(target - current) * maxDelta;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function lerp(from: number, to: number, alpha: number): number {
  return from + (to - from) * alpha;
}

function normalizeAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}