export interface GameLoopCallbacks {
  readonly fixedUpdate: (fixedDeltaTime: number) => void;
  readonly update: (deltaTime: number) => void;
  readonly render: () => void;
}

export interface GameLoopOptions {
  readonly fixedTimeStep: number;
  readonly maxAccumulatedTime: number;
}

/**
 * Owns the main browser frame loop.
 *
 * The loop separates:
 * - fixedUpdate: deterministic simulation steps
 * - update: variable-rate presentation updates
 * - render: drawing the current frame
 *
 * This is the foundation for future server-authoritative simulation,
 * client prediction and snapshot interpolation.
 */
export class GameLoop {
  private readonly callbacks: GameLoopCallbacks;
  private readonly options: GameLoopOptions;

  private animationFrameId: number | null = null;
  private previousTimeSeconds = 0;
  private accumulatedTime = 0;

  public constructor(callbacks: GameLoopCallbacks, options: GameLoopOptions) {
    this.callbacks = callbacks;
    this.options = options;
  }

  public start(): void {
    if (this.animationFrameId !== null) {
      return;
    }

    this.previousTimeSeconds = performance.now() / 1000;
    this.animationFrameId = window.requestAnimationFrame(this.tick);
  }

  public stop(): void {
    if (this.animationFrameId === null) {
      return;
    }

    window.cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }

  private readonly tick = (currentTimeMilliseconds: number): void => {
    const currentTimeSeconds = currentTimeMilliseconds / 1000;
    const deltaTime = currentTimeSeconds - this.previousTimeSeconds;

    this.previousTimeSeconds = currentTimeSeconds;

    this.accumulatedTime += Math.min(
      deltaTime,
      this.options.maxAccumulatedTime,
    );

    while (this.accumulatedTime >= this.options.fixedTimeStep) {
      this.callbacks.fixedUpdate(this.options.fixedTimeStep);
      this.accumulatedTime -= this.options.fixedTimeStep;
    }

    this.callbacks.update(deltaTime);
    this.callbacks.render();

    this.animationFrameId = window.requestAnimationFrame(this.tick);
  };
}