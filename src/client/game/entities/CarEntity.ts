import * as THREE from 'three';

export interface CarEntityOptions {
  readonly visual: THREE.Object3D;
}

/**
 * Local gameplay representation of a bumper car.
 *
 * For now this entity is client-side only.
 * Later, the authoritative server state should use a shared/network-safe
 * representation that does not depend on Three.js.
 */
export class CarEntity {
  public readonly visual: THREE.Object3D;

  public readonly position = new THREE.Vector3(0, 0, 0);
  public yaw = 0;
  public speed = 0;

  public constructor(options: CarEntityOptions) {
    this.visual = options.visual;
    this.syncVisual();
  }

  public syncVisual(): void {
    this.visual.position.copy(this.position);
    this.visual.rotation.y = this.yaw;
  }
}