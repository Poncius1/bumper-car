import { ComponentStore } from './ComponentStore';
import {
  INVALID_ENTITY_ID,
  MAX_ENTITY_ID,
  type EntityId,
} from './Entity';

interface RegisteredComponentStore {
  delete(entityId: EntityId): boolean;
  clear(): void;
}

/**
 * Owns entity lifetime and registered component stores.
 *
 * GameWorld does not know what specific components exist.
 * It only manages:
 *
 * - entity creation
 * - entity lifetime
 * - component cleanup
 * - deferred destruction
 */
export class GameWorld {
  private nextEntityId: EntityId = INVALID_ENTITY_ID + 1;

  private readonly aliveEntities = new Set<EntityId>();

  private readonly componentStores =
    new Set<RegisteredComponentStore>();

  private readonly pendingDestroyEntities: EntityId[] = [];

  public get entityCount(): number {
    return this.aliveEntities.size;
  }

  public createEntity(): EntityId {
    if (this.nextEntityId > MAX_ENTITY_ID) {
      throw new Error(
        'GameWorld exhausted the available uint32 entity ID range.',
      );
    }

    const entityId = this.nextEntityId;

    this.nextEntityId += 1;
    this.aliveEntities.add(entityId);

    return entityId;
  }

  public isAlive(entityId: EntityId): boolean {
    return this.aliveEntities.has(entityId);
  }

  public entities(): SetIterator<EntityId> {
    return this.aliveEntities.values();
  }

  public createComponentStore<TComponent>(): ComponentStore<TComponent> {
    const store = new ComponentStore<TComponent>();

    this.componentStores.add(store);

    return store;
  }

  /**
   * Queue destruction instead of mutating component stores while
   * a system is iterating over them.
   */
  public queueDestroyEntity(entityId: EntityId): void {
    if (!this.aliveEntities.has(entityId)) {
      return;
    }

    this.pendingDestroyEntities.push(entityId);
  }

  public destroyEntity(entityId: EntityId): boolean {
    if (!this.aliveEntities.delete(entityId)) {
      return false;
    }

    for (const store of this.componentStores) {
      store.delete(entityId);
    }

    return true;
  }

  public flushPendingEntityDestruction(): void {
    for (
      let index = 0;
      index < this.pendingDestroyEntities.length;
      index += 1
    ) {
      const entityId = this.pendingDestroyEntities[index];

      if (entityId !== undefined) {
        this.destroyEntity(entityId);
      }
    }

    this.pendingDestroyEntities.length = 0;
  }

  public clear(): void {
    this.aliveEntities.clear();
    this.pendingDestroyEntities.length = 0;

    for (const store of this.componentStores) {
      store.clear();
    }

    this.nextEntityId = INVALID_ENTITY_ID + 1;
  }
}