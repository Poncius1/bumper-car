import type { CarInputCommand } from '../input/CarInputCommand';

export class InputDebugOverlay {
  private readonly root: HTMLDivElement;

  public constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'input-debug-overlay';

    parent.appendChild(this.root);
  }

  public update(command: CarInputCommand): void {
    this.root.innerHTML = `
      <strong>Input Debug</strong>
      <span>Throttle: ${command.throttle.toFixed(2)}</span>
      <span>Steering: ${command.steering.toFixed(2)}</span>
      <span>Brake: ${command.brake ? 'ON' : 'OFF'}</span>
      <span>Boost: ${command.boost ? 'ON' : 'OFF'}</span>
    `;
  }

  public dispose(): void {
    this.root.remove();
  }
}