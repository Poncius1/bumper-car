import * as THREE from 'three';

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

import { RapierPhysicsWorld } from '../physics/RapierPhysicsWorld';

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

import { BoostSystem } from '../../shared/systems/BoostSystem';
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
  private readonly testCarEntityId: EntityId;

  private readonly boostSystem: BoostSystem;
  private readonly carControllerSystem: CarControllerSystem;

  private readonly cameraSystem: CameraSystem;
  private readonly carVisualFactory: CarVisualFactory;

  private physicsWorld: RapierPhysicsWorld | null = null;

  private simulationTick = 0;
  private physicsDebugVisible = true;
  private isDisposed = false;

  public constructor(root: HTMLElement) {
    this.root = root;
    this.root.classList.add('game-root');

    const scene = createBumperCarScene();

    this.runtimeTuning = createDefaultRuntimeTuning();

    this.world = new GameWorld();
    this.gameComponents = createGameComponents(this.world);
    this.clientComponents = createClientComponents(this.world);

    this.renderer = new ThreeRenderer({
      root: this.root,
      scene: scene.scene,
      camera: scene.camera,
    });

    this.inputSystem = new InputSystem();
    this.inputSystem.addSource(
      new KeyboardInputSource(),
    );

    this.gameplayDebugOverlay = new GameplayDebugOverlay(
      this.root,
    );

    this.runtimeTuningPanel = new RuntimeTuningPanel(
      this.root,
      this.runtimeTuning,
    );

    /*
     * Local player.
     */
    const localPlayer = createLocalCarEntity({
      world: this.world,
      gameComponents: this.gameComponents,
      clientComponents: this.clientComponents,
      visual: scene.localPlayerCar,
      mass: this.runtimeTuning.car.mass,
      controller: this.runtimeTuning.car,
      boost: GAME_CONFIG.boost,
    });

    this.localPlayerEntityId = localPlayer.entityId;

    /*
     * Second dynamic car used to test car-vs-car collisions.
     *
     * It has the same ECS components as a real future player,
     * but no input is assigned to it.
     */
    const testCarVisual = new THREE.Group();
    testCarVisual.name = 'TestCar';
    scene.scene.add(testCarVisual);

    const testCar = createLocalCarEntity({
      world: this.world,
      gameComponents: this.gameComponents,
      clientComponents: this.clientComponents,
      visual: testCarVisual,
      mass: this.runtimeTuning.car.mass,
      controller: this.runtimeTuning.car,
      boost: GAME_CONFIG.boost,
    });

    this.testCarEntityId = testCar.entityId;

    this.placeEntity(
      this.testCarEntityId,
      0,
      -10,
      0,
    );

    /*
     * Shared gameplay systems.
     */
    this.boostSystem = new BoostSystem(
      this.gameComponents,
    );

    this.carControllerSystem = new CarControllerSystem(
      this.gameComponents,
    );

    /*
     * Only the gameplay third-person camera is currently registered.
     */
    this.cameraSystem = new CameraSystem(
      [
        new ThirdPersonCarCamera({
          camera: scene.camera,
          tuning: this.runtimeTuning.camera.thirdPerson,
        }),
      ],
      'thirdPersonCar',
    );

    this.updateCarPresentations(
      1,
      1,
    );

    this.cameraSystem.update(
      this.getCameraTarget(),
      1,
    );

    this.carVisualFactory = new CarVisualFactory();

    void this.loadCarModels();
    void this.initializePhysics(scene.scene);

    window.addEventListener(
      'keydown',
      this.handleDebugKeyDown,
    );

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
    this.isDisposed = true;

    this.loop.stop();

    window.removeEventListener(
      'keydown',
      this.handleDebugKeyDown,
    );

    this.physicsWorld?.dispose();
    this.physicsWorld = null;

    this.carVisualFactory.dispose();
    this.runtimeTuningPanel.dispose();
    this.gameplayDebugOverlay.dispose();

    this.inputSystem.dispose();
    this.world.clear();

    this.renderer.dispose();
  }

  private async initializePhysics(
    scene: THREE.Scene,
  ): Promise<void> {
    try {
      const physicsWorld = await RapierPhysicsWorld.create(
        scene,
        this.gameComponents,
      );

      if (this.isDisposed) {
        physicsWorld.dispose();
        return;
      }

      physicsWorld.createCar(
        this.localPlayerEntityId,
      );

      physicsWorld.createCar(
        this.testCarEntityId,
      );

      physicsWorld.setDebugVisible(
        this.physicsDebugVisible,
      );

      this.physicsWorld = physicsWorld;

      console.info(
        'Rapier physics initialized.',
      );
    } catch (error) {
      console.error(
        'Failed to initialize Rapier physics.',
        error,
      );
    }
  }

  private async loadCarModels(): Promise<void> {
    try {
      const model = await this.carVisualFactory.loadPrototypeCarVisual({
        modelUrl: '/assets/models/cars/bumperCar.glb',
      });

      if (this.isDisposed) {
        return;
      }

      const localRenderable =
        this.clientComponents.renderables.require(
          this.localPlayerEntityId,
        );

      const testRenderable =
        this.clientComponents.renderables.require(
          this.testCarEntityId,
        );

      localRenderable.object.clear();
      testRenderable.object.clear();

     localRenderable.object.add(model);

      const testCarModel = model.clone(true);

      testCarModel.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) {
          return;
        }

        if (!(child.material instanceof THREE.MeshStandardMaterial)) {
          return;
        }

        child.material = child.material.clone();
        child.material.color.set(0xff3b30);
      });

      testRenderable.object.add(testCarModel);
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
    this.copyInputToLocalPlayer();

    /*
     * Runtime tuning currently controls both cars so they have
     * identical physics during collision testing.
     */
    this.syncRuntimeMass();

    /*
     * Fixed simulation order:
     *
     * input
     * → boost
     * → car controller
     * → Rapier
     */
    this.boostSystem.update(
      fixedDeltaTime,
    );

    this.carControllerSystem.update(
      fixedDeltaTime,
    );

    this.physicsWorld?.step(
      fixedDeltaTime,
    );

    this.world.flushPendingEntityDestruction();
  };

  private readonly update = (
    deltaTime: number,
    interpolationAlpha: number,
  ): void => {
    this.updateCarPresentations(
      deltaTime,
      interpolationAlpha,
    );

    this.cameraSystem.update(
      this.getCameraTarget(),
      deltaTime,
    );

    this.physicsWorld?.updateDebugRender();

    this.updateDebugOverlay(
      deltaTime,
    );
  };

  private readonly render = (): void => {
    this.renderer.render();
  };

  private copyInputToLocalPlayer(): void {
    const command = this.inputSystem.getCurrentCommand();

    const input = this.gameComponents.playerInputs.require(
      this.localPlayerEntityId,
    );

    input.throttle = command.throttle;
    input.steering = command.steering;
    input.brake = command.brake;
    input.boost = command.boost;
    input.tick = this.simulationTick;
  }

  private syncRuntimeMass(): void {
    const mass = Math.max(
      this.runtimeTuning.car.mass,
      0.001,
    );

    for (const motion of this.gameComponents.motions.values()) {
      motion.mass = mass;
    }
  }

  private updateCarPresentations(
    deltaTime: number,
    interpolationAlpha: number,
  ): void {
    for (
      const [entityId, presentation]
      of this.clientComponents.carPresentations.entries()
    ) {
      const transform = this.gameComponents.transforms.get(entityId);
      const state = this.gameComponents.carStates.get(entityId);
      const input = this.gameComponents.playerInputs.get(entityId);
      const renderable = this.clientComponents.renderables.get(entityId);

      if (!transform || !state || !input || !renderable) {
        continue;
      }

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

      const leanAmount = state.isDrifting
        ? this.runtimeTuning.car.visualDriftLeanAmount
        : this.runtimeTuning.car.visualLeanAmount;

      const targetRoll =
        -input.steering * leanAmount;

      const targetPitch =
        state.isBoosting ? -0.08 : 0;

      const presentationAlpha =
        1 -
        Math.exp(
          -12 * Math.max(deltaTime, 0),
        );

      presentation.visualRoll = lerp(
        presentation.visualRoll,
        targetRoll,
        presentationAlpha,
      );

      presentation.visualPitch = lerp(
        presentation.visualPitch,
        targetPitch,
        presentationAlpha,
      );

      renderable.object.visible = renderable.visible;

      renderable.object.position.copy(
        presentation.renderPosition,
      );

      renderable.object.rotation.set(
        presentation.visualPitch,
        presentation.renderYaw,
        presentation.visualRoll,
      );
    }
  }

  private updateDebugOverlay(
    deltaTime: number,
  ): void {
    const transform = this.gameComponents.transforms.require(
      this.localPlayerEntityId,
    );

    const motion = this.gameComponents.motions.require(
      this.localPlayerEntityId,
    );

    const state = this.gameComponents.carStates.require(
      this.localPlayerEntityId,
    );

    const boost = this.gameComponents.boosts.require(
      this.localPlayerEntityId,
    );

    const input = this.inputSystem.getCurrentCommand();

    const speed = Math.hypot(
      motion.velocityX,
      motion.velocityZ,
    );

    const forwardX = -Math.sin(transform.yaw);
    const forwardZ = -Math.cos(transform.yaw);

    const rightX = Math.cos(transform.yaw);
    const rightZ = -Math.sin(transform.yaw);

    const forwardSpeed =
      motion.velocityX * forwardX +
      motion.velocityZ * forwardZ;

    const lateralSpeed =
      motion.velocityX * rightX +
      motion.velocityZ * rightZ;

    this.gameplayDebugOverlay.update({
      deltaTime,
      fixedTimeStep: GAME_CONFIG.simulation.fixedTimeStep,

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
        angularVelocity: motion.angularVelocity,
        mass: motion.mass,

        isDrifting: state.isDrifting,
        isBoosting: state.isBoosting,
        slipRatio: state.slipRatio,
      },

      boost: {
        energy: boost.energy,
        maxEnergy: boost.maxEnergy,
        rechargeDelayRemaining: boost.rechargeDelayRemaining,
      },

      input,
      cameraMode: this.cameraSystem.mode,
      physicsDebugVisible: this.physicsDebugVisible,
    });
  }

  private getCameraTarget(): CameraTarget {
    const presentation =
      this.clientComponents.carPresentations.require(
        this.localPlayerEntityId,
      );

    return {
      position: presentation.renderPosition,
      yaw: presentation.renderYaw,
    };
  }

  private placeEntity(
    entityId: EntityId,
    positionX: number,
    positionZ: number,
    yaw: number,
  ): void {
    const transform = this.gameComponents.transforms.require(
      entityId,
    );

    transform.positionX = positionX;
    transform.positionY = 0;
    transform.positionZ = positionZ;

    transform.previousPositionX = positionX;
    transform.previousPositionY = 0;
    transform.previousPositionZ = positionZ;

    transform.yaw = yaw;
    transform.previousYaw = yaw;
  }

  private readonly handleDebugKeyDown = (
    event: KeyboardEvent,
  ): void => {
    if (event.code !== 'F3') {
      return;
    }

    event.preventDefault();

    this.physicsDebugVisible =
      !this.physicsDebugVisible;

    this.physicsWorld?.setDebugVisible(
      this.physicsDebugVisible,
    );
  };
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
  const difference = normalizeAngle(
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