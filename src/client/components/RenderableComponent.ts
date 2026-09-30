import type * as THREE from 'three';

export interface RenderableComponent {
  readonly object: THREE.Object3D;

  visible: boolean;
}

export function createRenderableComponent(
  object: THREE.Object3D,
): RenderableComponent {
  return {
    object,
    visible: true,
  };
}