import type * as THREE from 'three';

export interface CameraTarget {
  readonly position: THREE.Vector3;
  readonly yaw: number;
}