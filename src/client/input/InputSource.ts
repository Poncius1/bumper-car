import type { CarInputCommand } from './CarInputCommand';

export interface InputSource {
  update(): void;
  getCommand(): CarInputCommand;
  dispose(): void;
}