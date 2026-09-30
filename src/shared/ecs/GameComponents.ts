import type { CarControllerComponent, CarStateComponent } from '../components/CarComponents';
import type { MotionComponent } from '../components/MotionComponent';
import type { PlayerInputComponent } from '../components/PlayerInputComponent';
import type { TransformComponent } from '../components/TransformComponent';
import type { ComponentStore } from './ComponentStore';
import type { GameWorld } from './GameWorld';

export interface GameComponents {
  readonly transforms: ComponentStore<TransformComponent>;
  readonly motions: ComponentStore<MotionComponent>;

  readonly carControllers: ComponentStore<CarControllerComponent>;
  readonly carStates: ComponentStore<CarStateComponent>;

  readonly playerInputs: ComponentStore<PlayerInputComponent>;
}

export function createGameComponents(
  world: GameWorld,
): GameComponents {
  return {
    transforms:
      world.createComponentStore<TransformComponent>(),

    motions:
      world.createComponentStore<MotionComponent>(),

    carControllers:
      world.createComponentStore<CarControllerComponent>(),

    carStates:
      world.createComponentStore<CarStateComponent>(),

    playerInputs:
      world.createComponentStore<PlayerInputComponent>(),
  };
}