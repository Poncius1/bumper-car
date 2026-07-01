import * as THREE from 'three';

export interface CarEntityOptions {
  readonly visual: THREE.Object3D;
}

/**
 * Local gameplay representation of a bumper car.
 *
 * This entity owns simulation state. The visual object is only a presentation
 * root that follows the interpolated simulation transform.
 */
export class CarEntity {
  public readonly visual: THREE.Object3D;

  public readonly previousPosition = new THREE.Vector3(0, 0, 0);
  public readonly position = new THREE.Vector3(0, 0, 0);
  public readonly renderPosition = new THREE.Vector3(0, 0, 0);

  public readonly velocity = new THREE.Vector3(0, 0, 0);

  public previousYaw = 0;
  public yaw = 0;
  public renderYaw = 0;

  public angularVelocity = 0;
  public mass = 1;

  public constructor(options: CarEntityOptions) {
    this.visual = options.visual;
    this.syncVisual(1);
  }

  public get speed(): number {
    return getHorizontalLength(this.velocity);
  }

  public get forwardSpeed(): number {
    const forward = getForwardVector(this.yaw);

    return this.velocity.dot(forward);
  }

  public get lateralSpeed(): number {
    const right = getRightVector(this.yaw);

    return this.velocity.dot(right);
  }

  public beginSimulationStep(): void {
    this.previousPosition.copy(this.position);
    this.previousYaw = this.yaw;
  }

  /**
   * Applies an external impulse to the car.
   *
   * This is not used by collisions yet, but prepares the entity for:
   * - wall bounce
   * - car-to-car impacts
   * - power-ups
   * - knockback
   */
  public applyImpulse(impulse: THREE.Vector3): void {
    if (this.mass <= 0) {
      return;
    }

    this.velocity.addScaledVector(impulse, 1 / this.mass);
  }

  public syncVisual(interpolationAlpha: number): void {
    this.renderPosition.lerpVectors(
      this.previousPosition,
      this.position,
      interpolationAlpha,
    );

    this.renderYaw = lerpAngle(
      this.previousYaw,
      this.yaw,
      interpolationAlpha,
    );

    this.visual.position.copy(this.renderPosition);
    this.visual.rotation.y = this.renderYaw;
  }
}

function getHorizontalLength(vector: THREE.Vector3): number {
  return Math.hypot(vector.x, vector.z);
}

function getForwardVector(yaw: number): THREE.Vector3 {
  return new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
}

function getRightVector(yaw: number): THREE.Vector3 {
  return new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
}

function lerpAngle(from: number, to: number, alpha: number): number {
  const difference = normalizeAngle(to - from);

  return from + difference * alpha;
}

function normalizeAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}