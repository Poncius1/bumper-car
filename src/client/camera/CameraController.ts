import type { CameraTarget } from './CameraTarget';

export type CameraMode = 'thirdPersonCar';

export interface CameraController {
  readonly mode: CameraMode;

  update(target: CameraTarget, deltaTime: number): void;
}