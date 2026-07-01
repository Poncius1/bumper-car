import { GAME_CONFIG } from './GameConfig';
import { GameLoop } from './GameLoop';
import { ThirdPersonCarCamera } from '../camera/ThirdPersonCarCamera';
import {
  createDefaultRuntimeTuning,
  type RuntimeTuning,
} from '../debug/RuntimeTuning';
import { CarEntity } from '../game/entities/CarEntity';
import { CarMovementSystem } from '../game/systems/CarMovementSystem';
import { InputSystem } from '../input/InputSystem';
import { KeyboardInputSource } from '../input/KeyboardInputSource';
import { CarVisualFactory } from '../render/CarVisualFactory';
import { createBumperCarScene } from '../render/SceneFactory';
import { ThreeRenderer } from '../render/ThreeRenderer';
import { GameplayDebugOverlay } from '../ui/GameplayDebugOverlay';
import { RuntimeTuningPanel } from '../ui/RuntimeTuningPanel';

export class GameApp {
  private readonly root: HTMLElement;
  private readonly renderer: ThreeRenderer;
  private readonly loop: GameLoop;

  private readonly runtimeTuning: RuntimeTuning;

  private readonly inputSystem: InputSystem;
  private readonly gameplayDebugOverlay: GameplayDebugOverlay;
  private readonly runtimeTuningPanel: RuntimeTuningPanel;

  private readonly localPlayerCar: CarEntity;
  private readonly carMovementSystem: CarMovementSystem;
  private readonly cameraController: ThirdPersonCarCamera;
  private readonly carVisualFactory: CarVisualFactory;

  public constructor(root: HTMLElement) {
    this.root = root;
    this.root.classList.add('game-root');

    const scene = createBumperCarScene();

    this.runtimeTuning = createDefaultRuntimeTuning();

    this.renderer = new ThreeRenderer({
      root: this.root,
      scene: scene.scene,
      camera: scene.camera,
    });

    this.inputSystem = new InputSystem();
    this.inputSystem.addSource(new KeyboardInputSource());

    this.gameplayDebugOverlay = new GameplayDebugOverlay(this.root);

    this.runtimeTuningPanel = new RuntimeTuningPanel(
      this.root,
      this.runtimeTuning,
    );

    this.localPlayerCar = new CarEntity({
      visual: scene.localPlayerCar,
    });

    this.carMovementSystem = new CarMovementSystem(this.runtimeTuning.car);

    this.cameraController = new ThirdPersonCarCamera({
      camera: scene.camera,
      tuning: this.runtimeTuning.camera,
    });

    this.cameraController.snapToTarget(this.localPlayerCar);

    this.carVisualFactory = new CarVisualFactory();

    /**
     * Load the real prototype model asynchronously.
     *
     * The placeholder car remains visible until the GLB is loaded.
     */
    void this.loadPrototypeCarModel();

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

    this.carVisualFactory.dispose();
    this.runtimeTuningPanel.dispose();
    this.gameplayDebugOverlay.dispose();
    this.inputSystem.dispose();
    this.renderer.dispose();
  }

  private async loadPrototypeCarModel(): Promise<void> {
    try {
      const model = await this.carVisualFactory.loadPrototypeCarVisual({
        modelUrl: '/assets/models/cars/bumperCar.glb',
      });

      /**
       * Keep the gameplay root, but replace its temporary children.
       *
       * This preserves movement/camera logic because CarEntity still controls
       * the same root Object3D.
       */
      this.localPlayerCar.visual.clear();
      this.localPlayerCar.visual.add(model);
    } catch (error) {
      console.error('Failed to load prototype car model.', error);
    }
  }

  private readonly fixedUpdate = (fixedDeltaTime: number): void => {
    this.inputSystem.update();

    this.carMovementSystem.update(
      this.localPlayerCar,
      this.inputSystem.getCurrentCommand(),
      fixedDeltaTime,
    );
  };

  private readonly update = (
    deltaTime: number,
    interpolationAlpha: number,
  ): void => {
    /**
     * Smooth visual transform between fixed simulation steps.
     */
    this.localPlayerCar.syncVisual(interpolationAlpha);

    /**
     * Camera follows the interpolated render transform, not the raw simulation
     * transform. This helps reduce perceived jitter.
     */
    this.cameraController.update(
      {
        position: this.localPlayerCar.renderPosition,
        yaw: this.localPlayerCar.renderYaw,
      },
      deltaTime,
    );

    this.gameplayDebugOverlay.update({
      deltaTime,
      fixedTimeStep: GAME_CONFIG.simulation.fixedTimeStep,
      car: this.localPlayerCar,
      input: this.inputSystem.getCurrentCommand(),
      cameraMode: this.cameraController.mode,
    });
  };

  private readonly render = (): void => {
    this.renderer.render();
  };
}