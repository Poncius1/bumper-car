import * as THREE from 'three';
import type { RuntimeCameraTuning } from '../debug/RuntimeTuning';
import type { CameraController } from './CameraController';
import type { CameraTarget } from './CameraTarget';

export interface ThirdPersonCarCameraOptions {
  readonly camera: THREE.PerspectiveCamera;
  readonly tuning: RuntimeCameraTuning;
}

export class ThirdPersonCarCamera implements CameraController {
  public readonly mode = 'thirdPersonCar' as const;

  private readonly camera: THREE.PerspectiveCamera;
  private readonly tuning: RuntimeCameraTuning;
  private readonly currentLookAt = new THREE.Vector3();

  public constructor(options: ThirdPersonCarCameraOptions) {
    this.camera = options.camera;
    this.tuning = options.tuning;
  }

  public update(target: CameraTarget, deltaTime: number): void {
    const desiredPosition = this.getDesiredPosition(target);
    const desiredLookAt = this.getDesiredLookAt(target);

    const positionAlpha = getSmoothingAlpha(
      this.tuning.positionSmoothing,
      deltaTime,
    );

    const lookAtAlpha = getSmoothingAlpha(
      this.tuning.lookAtSmoothing,
      deltaTime,
    );

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
      target.position.x - forward.x * this.tuning.distance,
      target.position.y + this.tuning.height,
      target.position.z - forward.z * this.tuning.distance,
    );
  }

  private getDesiredLookAt(target: CameraTarget): THREE.Vector3 {
    return new THREE.Vector3(
      target.position.x,
      target.position.y + this.tuning.lookAtHeight,
      target.position.z,
    );
  }
}

function getForwardVector(yaw: number): THREE.Vector3 {
  return new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
}

function getSmoothingAlpha(smoothing: number, deltaTime: number): number {
  return 1 - Math.exp(-smoothing * deltaTime);
}