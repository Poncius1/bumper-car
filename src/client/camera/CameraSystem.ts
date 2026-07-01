import type { CameraController, CameraMode } from './CameraController';
import type { CameraTarget } from './CameraTarget';

export class CameraSystem {
  private readonly controllers = new Map<CameraMode, CameraController>();
  private readonly modeOrder: CameraMode[];

  private activeMode: CameraMode;

  public constructor(
    controllers: readonly CameraController[],
    initialMode: CameraMode,
  ) {
    if (controllers.length === 0) {
      throw new Error('CameraSystem requires at least one camera controller.');
    }

    this.modeOrder = controllers.map((controller) => controller.mode);

    for (const controller of controllers) {
      this.controllers.set(controller.mode, controller);
    }

    if (!this.controllers.has(initialMode)) {
      throw new Error(`Initial camera mode "${initialMode}" was not registered.`);
    }

    this.activeMode = initialMode;
  }

  public get mode(): CameraMode {
    return this.activeMode;
  }

  public update(target: CameraTarget, deltaTime: number): void {
    this.getActiveController().update(target, deltaTime);
  }

  public setMode(mode: CameraMode, target: CameraTarget): void {
    if (mode === this.activeMode) {
      return;
    }

    const controller = this.controllers.get(mode);

    if (!controller) {
      console.warn(`Camera mode "${mode}" does not exist.`);
      return;
    }

    this.activeMode = mode;
    controller.snapToTarget(target);
  }

  public nextMode(target: CameraTarget): void {
    const currentIndex = this.modeOrder.indexOf(this.activeMode);
    const nextIndex = (currentIndex + 1) % this.modeOrder.length;
    const nextMode = this.modeOrder[nextIndex];

    if (!nextMode) {
      return;
    }

    this.setMode(nextMode, target);
  }

  private getActiveController(): CameraController {
    const controller = this.controllers.get(this.activeMode);

    if (!controller) {
      throw new Error(`Camera mode "${this.activeMode}" is not registered.`);
    }

    return controller;
  }
}