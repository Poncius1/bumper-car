import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const PROTOTYPE_CAR_MODEL_CONFIG = {
  /**
   * Gameplay convention:
   * - Y is up
   * - XZ is the ground plane
   * - car front should point toward local -Z
   *
   * Your current model appears to face +Z, so we rotate it 180 degrees.
   * If the car moves backward visually, change this to 0.
   */
  rotationY: Math.PI,

  /**
   * Approximate gameplay length of the car in world units.
   *
   * The old placeholder car was around 2.4 units long.
   * A slightly larger value makes the imported model feel readable.
   */
  targetLength: 2.8,

  /**
   * Small vertical offset after grounding the model.
   * Increase slightly if wheels clip into the floor.
   */
  groundOffset: 0,
} as const;

const PROTOTYPE_CAR_MATERIAL_CONFIG = {
  bodyColor: 0x2563eb,
  roughness: 0.42,
  metalness: 0.18,
} as const;

export interface CarVisualFactoryOptions {
  readonly modelUrl: string;
}

export class CarVisualFactory {
  private readonly gltfLoader: GLTFLoader;
  private readonly dracoLoader: DRACOLoader;

  public constructor() {
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('/vendor/draco/');

    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  public async loadPrototypeCarVisual(
    options: CarVisualFactoryOptions,
  ): Promise<THREE.Object3D> {
    const gltf = await this.gltfLoader.loadAsync(options.modelUrl);

    const model = gltf.scene;
    model.name = 'PrototypeCarModel';

    prepareModelMaterials(model);

    /**
     * visualRoot is the object inserted into LocalPlayerCar.
     * It lets us adjust the imported asset without touching gameplay movement.
     */
    const visualRoot = new THREE.Group();
    visualRoot.name = 'PrototypeCarVisualRoot';

    /**
     * modelRoot owns model-specific normalization:
     * - scale
     * - centering
     * - ground alignment
     * - orientation correction
     */
    const modelRoot = new THREE.Group();
    modelRoot.name = 'PrototypeCarModelRoot';

    modelRoot.add(model);

    normalizeModelToGameplayScale(modelRoot, {
      targetLength: PROTOTYPE_CAR_MODEL_CONFIG.targetLength,
      rotationY: PROTOTYPE_CAR_MODEL_CONFIG.rotationY,
      groundOffset: PROTOTYPE_CAR_MODEL_CONFIG.groundOffset,
    });

    visualRoot.add(modelRoot);

    return visualRoot;
  }

  public dispose(): void {
    this.dracoLoader.dispose();
  }
}

function prepareModelMaterials(root: THREE.Object3D): void {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    child.castShadow = true;
    child.receiveShadow = true;

    child.material = new THREE.MeshStandardMaterial({
      color: PROTOTYPE_CAR_MATERIAL_CONFIG.bodyColor,
      roughness: PROTOTYPE_CAR_MATERIAL_CONFIG.roughness,
      metalness: PROTOTYPE_CAR_MATERIAL_CONFIG.metalness,
    });
  });
}

interface NormalizeModelOptions {
  readonly targetLength: number;
  readonly rotationY: number;
  readonly groundOffset: number;
}

function normalizeModelToGameplayScale(
  modelRoot: THREE.Object3D,
  options: NormalizeModelOptions,
): void {
  /**
   * Reset first so repeated hot reloads or future model changes
   * start from a predictable transform.
   */
  modelRoot.position.set(0, 0, 0);
  modelRoot.rotation.set(0, 0, 0);
  modelRoot.scale.setScalar(1);
  modelRoot.updateMatrixWorld(true);

  const initialBox = new THREE.Box3().setFromObject(modelRoot);
  const initialSize = new THREE.Vector3();

  initialBox.getSize(initialSize);

  const longestHorizontalSide = Math.max(initialSize.x, initialSize.z);

  if (longestHorizontalSide <= 0) {
    console.warn('Cannot normalize car model because its bounds are invalid.');
    return;
  }

  const scale = options.targetLength / longestHorizontalSide;

  modelRoot.scale.setScalar(scale);
  modelRoot.updateMatrixWorld(true);

  /**
   * Recompute bounds after scaling.
   */
  const scaledBox = new THREE.Box3().setFromObject(modelRoot);
  const scaledCenter = new THREE.Vector3();

  scaledBox.getCenter(scaledCenter);

  /**
   * Center the model around the gameplay root on X/Z,
   * and place the bottom of the model on Y = 0.
   */
  modelRoot.position.x -= scaledCenter.x;
  modelRoot.position.z -= scaledCenter.z;
  modelRoot.position.y -= scaledBox.min.y;
  modelRoot.position.y += options.groundOffset;

  /**
   * Apply orientation after centering.
   * Our controller expects the car front to point toward local -Z.
   */
  modelRoot.rotation.y = options.rotationY;

  modelRoot.updateMatrixWorld(true);
}