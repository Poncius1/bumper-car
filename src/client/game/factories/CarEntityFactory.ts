import type * as THREE from 'three';

import {
  createCarStateComponent,
  type CarControllerComponent,
} from '../../../shared/components/CarComponents';

import { createMotionComponent } from '../../../shared/components/MotionComponent';

import { createPlayerInputComponent } from '../../../shared/components/PlayerInputComponent';

import { createTransformComponent } from '../../../shared/components/TransformComponent';

import type { EntityId } from '../../../shared/ecs/Entity';
import type { GameComponents } from '../../../shared/ecs/GameComponents';
import type { GameWorld } from '../../../shared/ecs/GameWorld';

import { createCarPresentationComponent } from '../../components/CarPresentationComponent';

import { createRenderableComponent } from '../../components/RenderableComponent';

import type { ClientComponents } from '../../ecs/ClientComponents';

export interface CreateLocalCarEntityOptions {
  readonly world: GameWorld;

  readonly gameComponents: GameComponents;
  readonly clientComponents: ClientComponents;

  readonly visual: THREE.Object3D;

  readonly mass: number;

  /**
   * We intentionally keep the same object reference.
   *
   * Runtime tuning changes therefore immediately affect the
   * local car controller without copying configuration every tick.
   */
  readonly controller: CarControllerComponent;
}

export interface LocalCarEntity {
  readonly entityId: EntityId;
}

export function createLocalCarEntity(
  options: CreateLocalCarEntityOptions,
): LocalCarEntity {
  const entityId =
    options.world.createEntity();

  options.gameComponents.transforms.set(
    entityId,
    createTransformComponent(),
  );

  options.gameComponents.motions.set(
    entityId,
    createMotionComponent(options.mass),
  );

  options.gameComponents.carControllers.set(
    entityId,
    options.controller,
  );

  options.gameComponents.carStates.set(
    entityId,
    createCarStateComponent(),
  );

  options.gameComponents.playerInputs.set(
    entityId,
    createPlayerInputComponent(),
  );

  options.clientComponents.renderables.set(
    entityId,
    createRenderableComponent(
      options.visual,
    ),
  );

  options.clientComponents.carPresentations.set(
    entityId,
    createCarPresentationComponent(),
  );

  return {
    entityId,
  };
}