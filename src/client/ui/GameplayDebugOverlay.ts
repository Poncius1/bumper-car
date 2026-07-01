import type { CameraMode } from '../camera/CameraController';
import type { CarInputCommand } from '../input/CarInputCommand';

interface DebugPosition {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

interface DebugCarState {
  readonly position: DebugPosition;
  readonly speed: number;
  readonly yaw: number;
}

export interface GameplayDebugOverlayData {
  readonly deltaTime: number;
  readonly fixedTimeStep: number;
  readonly car: DebugCarState;
  readonly input: CarInputCommand;
  readonly cameraMode: CameraMode;
}

export class GameplayDebugOverlay {
  private readonly root: HTMLDivElement;

  private accumulatedTime = 0;
  private frameCount = 0;
  private displayedFps = 0;

  public constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'gameplay-debug-overlay';

    parent.appendChild(this.root);
  }

  public update(data: GameplayDebugOverlayData): void {
    this.updateFps(data.deltaTime);

    this.root.innerHTML = `
      <header class="gameplay-debug-overlay__header">
        <strong>Gameplay Debug</strong>
      </header>

      <section class="gameplay-debug-overlay__section">
        <span>FPS</span>
        <strong>${this.displayedFps}</strong>

        <span>Delta</span>
        <strong>${milliseconds(data.deltaTime)} ms</strong>

        <span>Fixed Step</span>
        <strong>${milliseconds(data.fixedTimeStep)} ms</strong>
      </section>

      <section class="gameplay-debug-overlay__section">
        <span>Car Position</span>
        <strong>${formatVector3(data.car.position)}</strong>

        <span>Speed</span>
        <strong>${data.car.speed.toFixed(2)}</strong>

        <span>Yaw</span>
        <strong>${radiansToDegrees(data.car.yaw).toFixed(1)}°</strong>
      </section>

      <section class="gameplay-debug-overlay__section">
        <span>Camera</span>
        <strong>${data.cameraMode}</strong>

        <span>Throttle</span>
        <strong>${data.input.throttle.toFixed(2)}</strong>

        <span>Steering</span>
        <strong>${data.input.steering.toFixed(2)}</strong>

        <span>Brake</span>
        <strong>${data.input.brake ? 'ON' : 'OFF'}</strong>

        <span>Boost</span>
        <strong>${data.input.boost ? 'ON' : 'OFF'}</strong>
      </section>
    `;
  }

  public dispose(): void {
    this.root.remove();
  }

  private updateFps(deltaTime: number): void {
    this.accumulatedTime += deltaTime;
    this.frameCount += 1;

    if (this.accumulatedTime < 0.25) {
      return;
    }

    this.displayedFps = Math.round(this.frameCount / this.accumulatedTime);
    this.accumulatedTime = 0;
    this.frameCount = 0;
  }
}

function milliseconds(seconds: number): string {
  return (seconds * 1000).toFixed(2);
}

function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

function formatVector3(position: DebugPosition): string {
  return `${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}`;
}