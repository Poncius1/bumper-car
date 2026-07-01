import type { CameraTarget } from './CameraTarget';

export type CameraMode =
  | 'thirdPersonCar'
  | 'topDownCar'
  | 'isometricCar'
  | 'staticArena';

export interface CameraController {
  readonly mode: CameraMode;

  update(target: CameraTarget, deltaTime: number): void;
  snapToTarget(target: CameraTarget): void;
}