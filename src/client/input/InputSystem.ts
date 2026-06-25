import {
  EMPTY_CAR_INPUT_COMMAND,
  type CarInputCommand,
} from './CarInputCommand';
import type { InputSource } from './InputSource';

export class InputSystem {
  private readonly sources: InputSource[] = [];
  private currentCommand: CarInputCommand = EMPTY_CAR_INPUT_COMMAND;

  public addSource(source: InputSource): void {
    this.sources.push(source);
  }

  public update(): void {
    for (const source of this.sources) {
      source.update();
    }

    this.currentCommand = this.mergeCommands();
  }

  public getCurrentCommand(): CarInputCommand {
    return this.currentCommand;
  }

  public dispose(): void {
    for (const source of this.sources) {
      source.dispose();
    }

    this.sources.length = 0;
    this.currentCommand = EMPTY_CAR_INPUT_COMMAND;
  }

  private mergeCommands(): CarInputCommand {
    if (this.sources.length === 0) {
      return EMPTY_CAR_INPUT_COMMAND;
    }

    /**
     * For now we only expect one source: keyboard.
     * Later, this method can prioritize touch/gamepad or combine sources.
     */
    return this.sources[0]?.getCommand() ?? EMPTY_CAR_INPUT_COMMAND;
  }
}