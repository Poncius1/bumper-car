import { GAME_CONFIG } from './GameConfig';
import { GameLoop } from './GameLoop';
import { createBumperCarScene } from '../render/SceneFactory';
import { ThreeRenderer } from '../render/ThreeRenderer';

export class GameApp {
  private readonly root: HTMLElement;
  private readonly renderer: ThreeRenderer;
  private readonly loop: GameLoop;

  public constructor(root: HTMLElement) {
    this.root = root;
    this.root.classList.add('game-root');

    const scene = createBumperCarScene();

    this.renderer = new ThreeRenderer({
      root: this.root,
      scene: scene.scene,
      camera: scene.camera,
    });

    this.loop = new GameLoop(
      {
        fixedUpdate: this.fixedUpdate,
        update: this.update,
        render: this.render,
      },
      {
        fixedTimeStep: GAME_CONFIG.simulation.fixedTimeStep,
        maxAccumulatedTime: GAME_CONFIG.simulation.maxAccumulatedTime,
      },
    );
  }

  public start(): void {
    this.loop.start();
  }

  public dispose(): void {
    this.loop.stop();
    this.renderer.dispose();
  }

  private readonly fixedUpdate = (_fixedDeltaTime: number): void => {
    /**
     * Future simulation code goes here:
     * - car movement
     * - collisions
     * - match rules
     * - local prediction
     */
  };

  private readonly update = (_deltaTime: number): void => {
    /**
     * Future presentation code goes here:
     * - camera smoothing
     * - UI updates
     * - animation blending
     */
  };

  private readonly render = (): void => {
    this.renderer.render();
  };
}