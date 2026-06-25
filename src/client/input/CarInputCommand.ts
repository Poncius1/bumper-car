export interface CarInputCommand {
  readonly throttle: number;
  readonly steering: number;
  readonly brake: boolean;
  readonly boost: boolean;
}

export const EMPTY_CAR_INPUT_COMMAND: CarInputCommand = {
  throttle: 0,
  steering: 0,
  brake: false,
  boost: false,
};