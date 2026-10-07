import { GAME_CONFIG } from './GameConfig';
import { GameLoop } from './GameLoop';

import { CameraSystem } from '../camera/CameraSystem';
import type { CameraTarget } from '../camera/CameraTarget';
import { ThirdPersonCarCamera } from '../camera/ThirdPersonCarCamera';

import {
  createDefaultRuntimeTuning,
  type RuntimeTuning,
} from '../debug/RuntimeTuning';

import {
  createClientComponents,
  type ClientComponents,
} from '../ecs/ClientComponents';

import { createLocalCarEntity } from '../game/factories/CarEntityFactory';

import { InputSystem } from '../input/InputSystem';
import { KeyboardInputSource } from '../input/KeyboardInputSource';

import { CarVisualFactory } from '../render/CarVisualFactory';
import { createBumperCarScene } from '../render/SceneFactory';
import { ThreeRenderer } from '../render/ThreeRenderer';

import { GameplayDebugOverlay } from '../ui/GameplayDebugOverlay';
import { RuntimeTuningPanel } from '../ui/RuntimeTuningPanel';

import {
  createGameComponents,
  type GameComponents,
} from '../../shared/ecs/GameComponents';

import type { EntityId } from '../../shared/ecs/Entity';
import { GameWorld } from '../../shared/ecs/GameWorld';

import { CarControllerSystem } from '../../shared/systems/CarControllerSystem';

export class GameApp {
  private readonly root: HTMLElement;

  private readonly renderer: ThreeRenderer;
  private readonly loop: GameLoop;

  private readonly runtimeTuning: RuntimeTuning;

  private readonly world: GameWorld;
  private readonly gameComponents: GameComponents;
  private readonly clientComponents: ClientComponents;

  private readonly inputSystem: InputSystem;

  private readonly gameplayDebugOverlay: GameplayDebugOverlay;
  private readonly runtimeTuningPanel: RuntimeTuningPanel;

  private readonly localPlayerEntityId: EntityId;

  private readonly carControllerSystem: CarControllerSystem;

  private readonly cameraSystem: CameraSystem;
  private readonly carVisualFactory: CarVisualFactory;

  private simulationTick = 0;

  public constructor(root: HTMLElement) {
    this.root = root;
    this.root.classList.add('game-root');

    const scene = createBumperCarScene();

    this.runtimeTuning = createDefaultRuntimeTuning();

    this.world = new GameWorld();

    this.gameComponents = createGameComponents(
      this.world,
    );

    this.clientComponents = createClientComponents(
      this.world,
    );

    this.renderer = new ThreeRenderer({
      root: this.root,
      scene: scene.scene,
      camera: scene.camera,
    });

    this.inputSystem = new InputSystem();

    this.inputSystem.addSource(
      new KeyboardInputSource(),
    );

    this.gameplayDebugOverlay =
      new GameplayDebugOverlay(
        this.root,
      );

    this.runtimeTuningPanel =
      new RuntimeTuningPanel(
        this.root,
        this.runtimeTuning,
      );

    const localPlayer = createLocalCarEntity({
      world: this.world,

      gameComponents: this.gameComponents,

      clientComponents: this.clientComponents,

      visual: scene.localPlayerCar,

      mass: this.runtimeTuning.car.mass,

      controller: this.runtimeTuning.car,
    });

    this.localPlayerEntityId =
      localPlayer.entityId;

    this.carControllerSystem =
      new CarControllerSystem(
        this.gameComponents,
      );

    /*
     * CameraSystem remains generic, but gameplay currently
     * registers only the third-person camera.
     *
     * Later the same system can support menu, spectator,
     * lobby or cinematic camera controllers.
     */
    this.cameraSystem = new CameraSystem(
      [
        new ThirdPersonCarCamera({
          camera: scene.camera,
          tuning:
            this.runtimeTuning.camera.thirdPerson,
        }),
      ],
      'thirdPersonCar',
    );

    this.updateCarPresentation(
      1,
      1,
    );

    this.cameraSystem.update(
      this.getCameraTarget(),
      1,
    );

    this.carVisualFactory =
      new CarVisualFactory();

    void this.loadPrototypeCarModel();

    this.loop = new GameLoop(
      {
        fixedUpdate: this.fixedUpdate,
        update: this.update,
        render: this.render,
      },
      {
        fixedTimeStep:
          GAME_CONFIG.simulation.fixedTimeStep,

        maxAccumulatedTime:
          GAME_CONFIG.simulation.maxAccumulatedTime,
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

    this.world.clear();

    this.renderer.dispose();
  }

  private async loadPrototypeCarModel(): Promise<void> {
    try {
      const model =
        await this.carVisualFactory
          .loadPrototypeCarVisual({
            modelUrl:
              '/assets/models/cars/bumperCar.glb',
          });

      const renderable =
        this.clientComponents.renderables.require(
          this.localPlayerEntityId,
        );

      renderable.object.clear();
      renderable.object.add(model);
    } catch (error) {
      console.error(
        'Failed to load prototype car model.',
        error,
      );
    }
  }

  private readonly fixedUpdate = (
    fixedDeltaTime: number,
  ): void => {
    this.simulationTick += 1;

    this.inputSystem.update();

    this.copyInputToEcs();

    /*
     * Mass currently lives in MotionComponent.
     * Keep it synchronized with runtime tuning until Rapier
     * becomes the authoritative physics implementation.
     */
    const motion =
      this.gameComponents.motions.require(
        this.localPlayerEntityId,
      );

    motion.mass = Math.max(
      this.runtimeTuning.car.mass,
      0.001,
    );

    this.carControllerSystem.update(
      fixedDeltaTime,
    );

    this.world.flushPendingEntityDestruction();
  };

  private readonly update = (
    deltaTime: number,
    interpolationAlpha: number,
  ): void => {
    this.updateCarPresentation(
      deltaTime,
      interpolationAlpha,
    );

    this.cameraSystem.update(
      this.getCameraTarget(),
      deltaTime,
    );

    this.updateDebugOverlay(
      deltaTime,
    );
  };

  private readonly render = (): void => {
    this.renderer.render();
  };

  private copyInputToEcs(): void {
    const command =
      this.inputSystem.getCurrentCommand();

    const input =
      this.gameComponents.playerInputs.require(
        this.localPlayerEntityId,
      );

    input.throttle = command.throttle;
    input.steering = command.steering;
    input.brake = command.brake;
    input.boost = command.boost;

    input.tick = this.simulationTick;
  }

  private updateCarPresentation(
    deltaTime: number,
    interpolationAlpha: number,
  ): void {
    const transform =
      this.gameComponents.transforms.require(
        this.localPlayerEntityId,
      );

    const state =
      this.gameComponents.carStates.require(
        this.localPlayerEntityId,
      );

    const input =
      this.gameComponents.playerInputs.require(
        this.localPlayerEntityId,
      );

    const presentation =
      this.clientComponents.carPresentations.require(
        this.localPlayerEntityId,
      );

    const renderable =
      this.clientComponents.renderables.require(
        this.localPlayerEntityId,
      );

    presentation.renderPosition.set(
      lerp(
        transform.previousPositionX,
        transform.positionX,
        interpolationAlpha,
      ),

      lerp(
        transform.previousPositionY,
        transform.positionY,
        interpolationAlpha,
      ),

      lerp(
        transform.previousPositionZ,
        transform.positionZ,
        interpolationAlpha,
      ),
    );

    presentation.renderYaw = lerpAngle(
      transform.previousYaw,
      transform.yaw,
      interpolationAlpha,
    );

    const leanAmount =
      state.isDrifting
        ? this.runtimeTuning.car
            .visualDriftLeanAmount
        : this.runtimeTuning.car
            .visualLeanAmount;

    const targetRoll =
      -input.steering *
      leanAmount;

    const targetPitch =
      state.isBoosting
        ? -0.08
        : 0;

    const presentationAlpha =
      1 -
      Math.exp(
        -12 *
          Math.max(
            deltaTime,
            0,
          ),
      );

    presentation.visualRoll =
      lerp(
        presentation.visualRoll,
        targetRoll,
        presentationAlpha,
      );

    presentation.visualPitch =
      lerp(
        presentation.visualPitch,
        targetPitch,
        presentationAlpha,
      );

    renderable.object.visible =
      renderable.visible;

    renderable.object.position.copy(
      presentation.renderPosition,
    );

    renderable.object.rotation.set(
      presentation.visualPitch,
      presentation.renderYaw,
      presentation.visualRoll,
    );
  }

  private updateDebugOverlay(
    deltaTime: number,
  ): void {
    const transform =
      this.gameComponents.transforms.require(
        this.localPlayerEntityId,
      );

    const motion =
      this.gameComponents.motions.require(
        this.localPlayerEntityId,
      );

    const state =
      this.gameComponents.carStates.require(
        this.localPlayerEntityId,
      );

    const input =
      this.inputSystem.getCurrentCommand();

    const speed =
      Math.hypot(
        motion.velocityX,
        motion.velocityZ,
      );

    const forwardX =
      -Math.sin(
        transform.yaw,
      );

    const forwardZ =
      -Math.cos(
        transform.yaw,
      );

    const rightX =
      Math.cos(
        transform.yaw,
      );

    const rightZ =
      -Math.sin(
        transform.yaw,
      );

    const forwardSpeed =
      motion.velocityX *
        forwardX +
      motion.velocityZ *
        forwardZ;

    const lateralSpeed =
      motion.velocityX *
        rightX +
      motion.velocityZ *
        rightZ;

    this.gameplayDebugOverlay.update({
      deltaTime,

      fixedTimeStep:
        GAME_CONFIG.simulation.fixedTimeStep,

      car: {
        position: {
          x: transform.positionX,
          y: transform.positionY,
          z: transform.positionZ,
        },

        velocity: {
          x: motion.velocityX,
          y: motion.velocityY,
          z: motion.velocityZ,
        },

        speed,
        forwardSpeed,
        lateralSpeed,

        yaw: transform.yaw,

        angularVelocity:
          motion.angularVelocity,

        mass:
          motion.mass,

        isDrifting:
          state.isDrifting,

        isBoosting:
          state.isBoosting,

        slipRatio:
          state.slipRatio,
      },

      input,

      cameraMode:
        this.cameraSystem.mode,
    });
  }

  private getCameraTarget(): CameraTarget {
    const presentation =
      this.clientComponents.carPresentations.require(
        this.localPlayerEntityId,
      );

    return {
      position:
        presentation.renderPosition,

      yaw:
        presentation.renderYaw,
    };
  }
}

function lerp(
  from: number,
  to: number,
  alpha: number,
): number {
  return from + (to - from) * alpha;
}

function lerpAngle(
  from: number,
  to: number,
  alpha: number,
): number {
  const difference =
    normalizeAngle(
      to - from,
    );

  return from + difference * alpha;
}

function normalizeAngle(
  angle: number,
): number {
  return Math.atan2(
    Math.sin(angle),
    Math.cos(angle),
  );
}