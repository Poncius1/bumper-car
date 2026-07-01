import * as THREE from 'three';
import type { RuntimeIsometricCameraTuning } from '../debug/RuntimeTuning';
import type { CameraController } from './CameraController';
import type { CameraTarget } from './CameraTarget';

export interface IsometricCarCameraOptions {
  readonly camera: THREE.PerspectiveCamera;
  readonly tuning: RuntimeIsometricCameraTuning;
}

export class IsometricCarCamera implements CameraController {
  public readonly mode = 'isometricCar' as const;

  private readonly camera: THREE.PerspectiveCamera;
  private readonly tuning: RuntimeIsometricCameraTuning;
  private readonly currentLookAt = new THREE.Vector3();

  public constructor(options: IsometricCarCameraOptions) {
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

    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(this.currentLookAt);
  }

  public snapToTarget(target: CameraTarget): void {
    const desiredPosition = this.getDesiredPosition(target);
    const desiredLookAt = this.getDesiredLookAt(target);

    this.camera.position.copy(desiredPosition);
    this.currentLookAt.copy(desiredLookAt);

    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(this.currentLookAt);
  }

  private getDesiredPosition(target: CameraTarget): THREE.Vector3 {
    const angle = degreesToRadians(this.tuning.angleDegrees);
    const offsetX = Math.sin(angle) * this.tuning.distance;
    const offsetZ = Math.cos(angle) * this.tuning.distance;

    return new THREE.Vector3(
      target.position.x + offsetX,
      target.position.y + this.tuning.height,
      target.position.z + offsetZ,
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

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function getSmoothingAlpha(smoothing: number, deltaTime: number): number {
  return 1 - Math.exp(-smoothing * deltaTime);
}