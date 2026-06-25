import {
  EMPTY_CAR_INPUT_COMMAND,
  type CarInputCommand,
} from './CarInputCommand';
import type { InputSource } from './InputSource';

export class KeyboardInputSource implements InputSource {
  private readonly pressedKeys = new Set<string>();
  private currentCommand: CarInputCommand = EMPTY_CAR_INPUT_COMMAND;

  public constructor() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleWindowBlur);
  }

  public update(): void {
    const throttle = this.getThrottleAxis();
    const steering = this.getSteeringAxis();

    this.currentCommand = {
      throttle,
      steering,
      brake: this.isPressed('Space'),
      boost: this.isPressed('ShiftLeft') || this.isPressed('ShiftRight'),
    };
  }

  public getCommand(): CarInputCommand {
    return this.currentCommand;
  }

  public dispose(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleWindowBlur);

    this.pressedKeys.clear();
    this.currentCommand = EMPTY_CAR_INPUT_COMMAND;
  }

  private getThrottleAxis(): number {
    const forward = this.isPressed('KeyW') || this.isPressed('ArrowUp');
    const backward = this.isPressed('KeyS') || this.isPressed('ArrowDown');

    if (forward && !backward) {
      return 1;
    }

    if (backward && !forward) {
      return -1;
    }

    return 0;
  }

  private getSteeringAxis(): number {
    const left = this.isPressed('KeyA') || this.isPressed('ArrowLeft');
    const right = this.isPressed('KeyD') || this.isPressed('ArrowRight');

    if (right && !left) {
      return 1;
    }

    if (left && !right) {
      return -1;
    }

    return 0;
  }

  private isPressed(code: string): boolean {
    return this.pressedKeys.has(code);
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    this.pressedKeys.add(event.code);
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    this.pressedKeys.delete(event.code);
  };

  private readonly handleWindowBlur = (): void => {
    this.pressedKeys.clear();
    this.currentCommand = EMPTY_CAR_INPUT_COMMAND;
  };
}