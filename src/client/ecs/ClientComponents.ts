import type { CarPresentationComponent } from '../components/CarPresentationComponent';
import type { RenderableComponent } from '../components/RenderableComponent';

import type { ComponentStore } from '../../shared/ecs/ComponentStore';
import type { GameWorld } from '../../shared/ecs/GameWorld';

export interface ClientComponents {
  readonly renderables: ComponentStore<RenderableComponent>;

  readonly carPresentations:
    ComponentStore<CarPresentationComponent>;
}

export function createClientComponents(
  world: GameWorld,
): ClientComponents {
  return {
    renderables:
      world.createComponentStore<RenderableComponent>(),

    carPresentations:
      world.createComponentStore<CarPresentationComponent>(),
  };
}