export interface PlayerInputComponent {
  throttle: number;
  steering: number;

  brake: boolean;
  boost: boolean;

  /**
   * Simulation tick associated with this input.
   *
   * This becomes important later for:
   * - client prediction
   * - server reconciliation
   * - dropped/out-of-order packets
   */
  tick: number;
}

export function createPlayerInputComponent(): PlayerInputComponent {
  return {
    throttle: 0,
    steering: 0,

    brake: false,
    boost: false,

    tick: 0,
  };
}

export function resetPlayerInputComponent(
  input: PlayerInputComponent,
): void {
  input.throttle = 0;
  input.steering = 0;

  input.brake = false;
  input.boost = false;
}