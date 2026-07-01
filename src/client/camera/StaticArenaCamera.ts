import * as THREE from 'three';
import type { RuntimeStaticArenaCameraTuning } from '../debug/RuntimeTuning';
import type { CameraController } from './CameraController';
import type { CameraTarget } from './CameraTarget';

export interface StaticArenaCameraOptions {
  readonly camera: THREE.PerspectiveCamera;
  readonly tuning: RuntimeStaticArenaCameraTuning;
}

export class StaticArenaCamera implements CameraController {
  public readonly mode = 'staticArena' as const;

  private readonly camera: THREE.PerspectiveCamera;
  private readonly tuning: RuntimeStaticArenaCameraTuning;

  public constructor(options: StaticArenaCameraOptions) {
    this.camera = options.camera;
    this.tuning = options.tuning;
  }

  public update(_target: CameraTarget, _deltaTime: number): void {
    this.applyTransform();
  }

  public snapToTarget(_target: CameraTarget): void {
    this.applyTransform();
  }

  private applyTransform(): void {
    this.camera.position.set(
      this.tuning.positionX,
      this.tuning.positionY,
      this.tuning.positionZ,
    );

    this.camera.up.set(0, 1, 0);

    this.camera.lookAt(
      this.tuning.lookAtX,
      this.tuning.lookAtY,
      this.tuning.lookAtZ,
    );
  }
}