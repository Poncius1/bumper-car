/**
 * Unique identifier for an entity during the lifetime of a GameWorld.
 *
 * Entity IDs are numeric because they are cheap to compare,
 * serialize and send through the network.
 */
export type EntityId = number;

export const INVALID_ENTITY_ID: EntityId = 0;
export const MAX_ENTITY_ID: EntityId = 0xffff_ffff;

export function isValidEntityId(entityId: EntityId): boolean {
  return (
    Number.isInteger(entityId) &&
    entityId > INVALID_ENTITY_ID &&
    entityId <= MAX_ENTITY_ID
  );
}