import { GAME_CONFIG } from './GameConfig';
import { GameLoop } from './GameLoop';
import { InputSystem } from '../input/InputSystem';
import { KeyboardInputSource } from '../input/KeyboardInputSource';
import { createBumperCarScene } from '../render/SceneFactory';
import { ThreeRenderer } from '../render/ThreeRenderer';
import { InputDebugOverlay } from '../ui/InputDebug.ts';

export class GameApp {
  private readonly root: HTMLElement;
  private readonly renderer: ThreeRenderer;
  private readonly loop: GameLoop;
  private readonly inputSystem: InputSystem;
  private readonly inputDebugOverlay: InputDebugOverlay;

  public constructor(root: HTMLElement) {
    this.root = root;
    this.root.classList.add('game-root');

    const scene = createBumperCarScene();

    this.renderer = new ThreeRenderer({
      root: this.root,
      scene: scene.scene,
      camera: scene.camera,
    });

    this.inputSystem = new InputSystem();
    this.inputSystem.addSource(new KeyboardInputSource());

    this.inputDebugOverlay = new InputDebugOverlay(this.root);

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
    this.inputDebugOverlay.dispose();
    this.inputSystem.dispose();
    this.renderer.dispose();
  }

  private readonly fixedUpdate = (_fixedDeltaTime: number): void => {
    /**
     * Future simulation code:
     * - read current input command
     * - update car movement
     * - send input command to server
     */
  };

  private readonly update = (_deltaTime: number): void => {
    this.inputSystem.update();
    this.inputDebugOverlay.update(this.inputSystem.getCurrentCommand());
  };

  private readonly render = (): void => {
    this.renderer.render();
  };
}