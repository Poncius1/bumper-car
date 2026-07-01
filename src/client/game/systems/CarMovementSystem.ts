import type { CarInputCommand } from '../../input/CarInputCommand';
import type { CarEntity } from '../entities/CarEntity';

export interface CarMovementConfig {
  readonly acceleration: number;
  readonly reverseAcceleration: number;
  readonly brakeDeceleration: number;
  readonly drag: number;
  readonly maxForwardSpeed: number;
  readonly maxReverseSpeed: number;
  readonly turnSpeed: number;
  readonly boostMultiplier: number;
}

export class CarMovementSystem {
  private readonly config: CarMovementConfig;

  public constructor(config: CarMovementConfig) {
    this.config = config;
  }

  public update(car: CarEntity, input: CarInputCommand, deltaTime: number): void {
  car.beginSimulationStep();

  this.updateSpeed(car, input, deltaTime);
  this.updateRotation(car, input, deltaTime);
  this.updatePosition(car, deltaTime);

  car.yaw = normalizeAngle(car.yaw);
}

  private updateSpeed(
    car: CarEntity,
    input: CarInputCommand,
    deltaTime: number,
  ): void {
    if (input.brake) {
      car.speed = moveTowards(
        car.speed,
        0,
        this.config.brakeDeceleration * deltaTime,
      );

      return;
    }

    if (input.throttle > 0) {
      const maxSpeed = input.boost
        ? this.config.maxForwardSpeed * this.config.boostMultiplier
        : this.config.maxForwardSpeed;

      car.speed += this.config.acceleration * deltaTime;
      car.speed = Math.min(car.speed, maxSpeed);

      return;
    }

    if (input.throttle < 0) {
      car.speed -= this.config.reverseAcceleration * deltaTime;
      car.speed = Math.max(car.speed, -this.config.maxReverseSpeed);

      return;
    }

    car.speed = moveTowards(car.speed, 0, this.config.drag * deltaTime);
  }

  private updateRotation(
    car: CarEntity,
    input: CarInputCommand,
    deltaTime: number,
  ): void {
    const normalizedSpeed = clamp(
      Math.abs(car.speed) / this.config.maxForwardSpeed,
      0,
      1,
    );

    if (normalizedSpeed <= 0.02) {
      return;
    }

    /**
     * When reversing, steering should feel inverted, like a real car.
     * This makes the placeholder feel closer to an actual vehicle.
     */
    const direction = car.speed >= 0 ? 1 : -1;
    const turnAmount =
      input.steering *
      direction *
      this.config.turnSpeed *
      normalizedSpeed *
      deltaTime;

    car.yaw -= turnAmount;
  }

  private updatePosition(car: CarEntity, deltaTime: number): void {
    /**
     * In our convention:
     * - Y is up
     * - XZ is the arena plane
     * - the car's visual front points toward local -Z
     */
    const forwardX = -Math.sin(car.yaw);
    const forwardZ = -Math.cos(car.yaw);

    car.position.x += forwardX * car.speed * deltaTime;
    car.position.z += forwardZ * car.speed * deltaTime;
  }
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

function normalizeAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}