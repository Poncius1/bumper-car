import type { EntityId } from './Entity';

/**
 * Generic storage for a single component type.
 *
 * Internally it uses Map for now:
 * - simple
 * - fast enough for our current entity count
 * - no array allocations when iterating
 *
 * We can replace the internal implementation later without changing
 * the systems that consume this store.
 */
export class ComponentStore<TComponent> {
  private readonly components = new Map<EntityId, TComponent>();

  public get size(): number {
    return this.components.size;
  }

  public has(entityId: EntityId): boolean {
    return this.components.has(entityId);
  }

  public get(entityId: EntityId): TComponent | undefined {
    return this.components.get(entityId);
  }

  public require(entityId: EntityId): TComponent {
    const component = this.components.get(entityId);

    if (component === undefined) {
      throw new Error(
        `Entity ${entityId} does not contain the requested component.`,
      );
    }

    return component;
  }

  public set(
    entityId: EntityId,
    component: TComponent,
  ): TComponent {
    this.components.set(entityId, component);
    return component;
  }

  public delete(entityId: EntityId): boolean {
    return this.components.delete(entityId);
  }

  public clear(): void {
    this.components.clear();
  }

  public entries(): MapIterator<[EntityId, TComponent]> {
    return this.components.entries();
  }

  public keys(): MapIterator<EntityId> {
    return this.components.keys();
  }

  public values(): MapIterator<TComponent> {
    return this.components.values();
  }
}