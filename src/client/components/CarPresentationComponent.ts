import * as THREE from 'three';

export interface CarPresentationComponent {
  readonly renderPosition: THREE.Vector3;

  renderYaw: number;

  visualRoll: number;
  visualPitch: number;
}

export function createCarPresentationComponent(): CarPresentationComponent {
  return {
    renderPosition: new THREE.Vector3(),

    renderYaw: 0,

    visualRoll: 0,
    visualPitch: 0,
  };
}