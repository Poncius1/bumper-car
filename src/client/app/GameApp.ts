import { GAME_CONFIG } from './GameConfig';
import { GameLoop } from './GameLoop';
import type { CameraMode } from '../camera/CameraController';
import { CameraSystem } from '../camera/CameraSystem';
import type { CameraTarget } from '../camera/CameraTarget';
import { IsometricCarCamera } from '../camera/IsometricCarCamera';
import { StaticArenaCamera } from '../camera/StaticArenaCamera';
import { ThirdPersonCarCamera } from '../camera/ThirdPersonCarCamera';
import { TopDownCarCamera } from '../camera/TopDownCarCamera';
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
  private readonly cameraSystem: CameraSystem;
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

    this.cameraSystem = new CameraSystem(
      [
        new ThirdPersonCarCamera({
          camera: scene.camera,
          tuning: this.runtimeTuning.camera.thirdPerson,
        }),
        new TopDownCarCamera({
          camera: scene.camera,
          tuning: this.runtimeTuning.camera.topDown,
        }),
        new IsometricCarCamera({
          camera: scene.camera,
          tuning: this.runtimeTuning.camera.isometric,
        }),
        new StaticArenaCamera({
          camera: scene.camera,
          tuning: this.runtimeTuning.camera.staticArena,
        }),
      ],
      'thirdPersonCar',
    );

    this.cameraSystem.update(this.getCameraTarget(), 1);

    window.addEventListener('keydown', this.handleCameraModeKeyDown);

    this.carVisualFactory = new CarVisualFactory();

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

    window.removeEventListener('keydown', this.handleCameraModeKeyDown);

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
    this.localPlayerCar.syncVisual(interpolationAlpha);

    this.cameraSystem.update(this.getCameraTarget(), deltaTime);

    this.gameplayDebugOverlay.update({
      deltaTime,
      fixedTimeStep: GAME_CONFIG.simulation.fixedTimeStep,
      car: this.localPlayerCar,
      input: this.inputSystem.getCurrentCommand(),
      cameraMode: this.cameraSystem.mode,
    });
  };

  private readonly render = (): void => {
    this.renderer.render();
  };

  private getCameraTarget(): CameraTarget {
    return {
      position: this.localPlayerCar.renderPosition,
      yaw: this.localPlayerCar.renderYaw,
    };
  }

  private readonly handleCameraModeKeyDown = (event: KeyboardEvent): void => {
    const mode = getCameraModeFromKeyboardEvent(event);

    if (mode) {
      this.cameraSystem.setMode(mode, this.getCameraTarget());
      return;
    }

    if (event.code === 'KeyC') {
      this.cameraSystem.nextMode(this.getCameraTarget());
    }
  };
}

function getCameraModeFromKeyboardEvent(
  event: KeyboardEvent,
): CameraMode | null {
  if (event.code === 'Digit1') {
    return 'thirdPersonCar';
  }

  if (event.code === 'Digit2') {
    return 'topDownCar';
  }

  if (event.code === 'Digit3') {
    return 'isometricCar';
  }

  if (event.code === 'Digit4') {
    return 'staticArena';
  }

  return null;
}