import type { CameraTarget } from './CameraTarget';

export interface CameraController {
  update(target: CameraTarget, deltaTime: number): void;
}