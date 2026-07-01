import * as THREE from 'three';

export interface CarEntityOptions {
  readonly visual: THREE.Object3D;
}

export class CarEntity {
  public readonly visual: THREE.Object3D;

  public readonly previousPosition = new THREE.Vector3(0, 0, 0);
  public readonly position = new THREE.Vector3(0, 0, 0);
  public readonly renderPosition = new THREE.Vector3(0, 0, 0);

  public previousYaw = 0;
  public yaw = 0;
  public renderYaw = 0;

  public speed = 0;

  public constructor(options: CarEntityOptions) {
    this.visual = options.visual;
    this.syncVisual(1);
  }

  public beginSimulationStep(): void {
    this.previousPosition.copy(this.position);
    this.previousYaw = this.yaw;
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

function lerpAngle(from: number, to: number, alpha: number): number {
  const difference = normalizeAngle(to - from);

  return from + difference * alpha;
}

function normalizeAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}