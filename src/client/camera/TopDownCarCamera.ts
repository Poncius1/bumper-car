import * as THREE from 'three';
import type { RuntimeTopDownCameraTuning } from '../debug/RuntimeTuning';
import type { CameraController } from './CameraController';
import type { CameraTarget } from './CameraTarget';

export interface TopDownCarCameraOptions {
  readonly camera: THREE.PerspectiveCamera;
  readonly tuning: RuntimeTopDownCameraTuning;
}

export class TopDownCarCamera implements CameraController {
  public readonly mode = 'topDownCar' as const;

  private readonly camera: THREE.PerspectiveCamera;
  private readonly tuning: RuntimeTopDownCameraTuning;
  private readonly currentLookAt = new THREE.Vector3();

  public constructor(options: TopDownCarCameraOptions) {
    this.camera = options.camera;
    this.tuning = options.tuning;
  }

  public update(target: CameraTarget, deltaTime: number): void {
    const desiredPosition = this.getDesiredPosition(target);
    const desiredLookAt = this.getDesiredLookAt(target);

    const alpha = getSmoothingAlpha(this.tuning.positionSmoothing, deltaTime);

    this.camera.position.lerp(desiredPosition, alpha);
    this.currentLookAt.lerp(desiredLookAt, alpha);

    this.camera.up.set(0, 0, -1);
    this.camera.lookAt(this.currentLookAt);
  }

  public snapToTarget(target: CameraTarget): void {
    const desiredPosition = this.getDesiredPosition(target);
    const desiredLookAt = this.getDesiredLookAt(target);

    this.camera.position.copy(desiredPosition);
    this.currentLookAt.copy(desiredLookAt);

    this.camera.up.set(0, 0, -1);
    this.camera.lookAt(this.currentLookAt);
  }

  private getDesiredPosition(target: CameraTarget): THREE.Vector3 {
    return new THREE.Vector3(
      target.position.x,
      target.position.y + this.tuning.height,
      target.position.z,
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

function getSmoothingAlpha(smoothing: number, deltaTime: number): number {
  return 1 - Math.exp(-smoothing * deltaTime);
}