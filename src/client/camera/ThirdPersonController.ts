import * as THREE from 'three';
import type { CameraController } from './CameraController';
import type { CameraTarget } from './CameraTarget';

export interface ThirdPersonCarCameraOptions {
  readonly camera: THREE.PerspectiveCamera;
  readonly distance: number;
  readonly height: number;
  readonly lookAtHeight: number;
  readonly positionSmoothing: number;
  readonly lookAtSmoothing: number;
}

export class ThirdPersonCarCamera implements CameraController {
  private readonly camera: THREE.PerspectiveCamera;
  private readonly distance: number;
  private readonly height: number;
  private readonly lookAtHeight: number;
  private readonly positionSmoothing: number;
  private readonly lookAtSmoothing: number;

  private readonly currentLookAt = new THREE.Vector3();

  public constructor(options: ThirdPersonCarCameraOptions) {
    this.camera = options.camera;
    this.distance = options.distance;
    this.height = options.height;
    this.lookAtHeight = options.lookAtHeight;
    this.positionSmoothing = options.positionSmoothing;
    this.lookAtSmoothing = options.lookAtSmoothing;
  }

  public update(target: CameraTarget, deltaTime: number): void {
    const desiredPosition = this.getDesiredPosition(target);
    const desiredLookAt = this.getDesiredLookAt(target);

    const positionAlpha = getSmoothingAlpha(this.positionSmoothing, deltaTime);
    const lookAtAlpha = getSmoothingAlpha(this.lookAtSmoothing, deltaTime);

    this.camera.position.lerp(desiredPosition, positionAlpha);
    this.currentLookAt.lerp(desiredLookAt, lookAtAlpha);

    this.camera.lookAt(this.currentLookAt);
  }

  public snapToTarget(target: CameraTarget): void {
    const desiredPosition = this.getDesiredPosition(target);
    const desiredLookAt = this.getDesiredLookAt(target);

    this.camera.position.copy(desiredPosition);
    this.currentLookAt.copy(desiredLookAt);
    this.camera.lookAt(this.currentLookAt);
  }

  private getDesiredPosition(target: CameraTarget): THREE.Vector3 {
    const forward = getForwardVector(target.yaw);

    return new THREE.Vector3(
      target.position.x - forward.x * this.distance,
      target.position.y + this.height,
      target.position.z - forward.z * this.distance,
    );
  }

  private getDesiredLookAt(target: CameraTarget): THREE.Vector3 {
    return new THREE.Vector3(
      target.position.x,
      target.position.y + this.lookAtHeight,
      target.position.z,
    );
  }
}

/**
 * The placeholder car points toward local -Z.
 * This converts yaw into that forward direction on the XZ plane.
 */
function getForwardVector(yaw: number): THREE.Vector3 {
  return new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
}

/**
 * Frame-rate independent smoothing.
 * Higher smoothing values follow the target faster.
 */
function getSmoothingAlpha(smoothing: number, deltaTime: number): number {
  return 1 - Math.exp(-smoothing * deltaTime);
}