import { GAME_CONFIG } from './GameConfig';
import { GameLoop } from './GameLoop';
import { ThirdPersonCarCamera } from '../camera/ThirdPersonController';
import { CarEntity } from '../game/entities/CarEntity';
import { CarMovementSystem } from '../game/systems/CarMovementSystem';
import { InputSystem } from '../input/InputSystem';
import { KeyboardInputSource } from '../input/KeyboardInputSource';
import { createBumperCarScene } from '../render/SceneFactory';
import { ThreeRenderer } from '../render/ThreeRenderer';
import { GameplayDebugOverlay } from '../ui/GameplayDebugOverlay';

export class GameApp {
  private readonly root: HTMLElement;
  private readonly renderer: ThreeRenderer;
  private readonly loop: GameLoop;

  private readonly inputSystem: InputSystem;
  private readonly gameplayDebugOverlay: GameplayDebugOverlay;

  private readonly localPlayerCar: CarEntity;
  private readonly carMovementSystem: CarMovementSystem;
  private readonly cameraController: ThirdPersonCarCamera;

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

    this.gameplayDebugOverlay = new GameplayDebugOverlay(this.root);

    this.localPlayerCar = new CarEntity({
      visual: scene.localPlayerCar,
    });

    this.carMovementSystem = new CarMovementSystem(GAME_CONFIG.car);

    this.cameraController = new ThirdPersonCarCamera({
      camera: scene.camera,
      distance: GAME_CONFIG.camera.distance,
      height: GAME_CONFIG.camera.height,
      lookAtHeight: GAME_CONFIG.camera.lookAtHeight,
      positionSmoothing: GAME_CONFIG.camera.positionSmoothing,
      lookAtSmoothing: GAME_CONFIG.camera.lookAtSmoothing,
    });

    this.cameraController.snapToTarget(this.localPlayerCar);

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
    this.gameplayDebugOverlay.dispose();
    this.inputSystem.dispose();
    this.renderer.dispose();
  }

  private readonly fixedUpdate = (fixedDeltaTime: number): void => {
    this.carMovementSystem.update(
      this.localPlayerCar,
      this.inputSystem.getCurrentCommand(),
      fixedDeltaTime,
    );
  };

 private readonly update = (deltaTime: number): void => {
  this.inputSystem.update();
  this.cameraController.update(this.localPlayerCar, deltaTime);

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