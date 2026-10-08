import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

import type { EntityId } from '../../shared/ecs/Entity';
import type { GameComponents } from '../../shared/ecs/GameComponents';

const CAR_COLLIDER = {
  halfWidth: 0.72,
  halfHeight: 0.45,
  halfLength: 1.35,

  centerY: 0.45,

  friction: 0.35,
  restitution: 0.25,
} as const;

const STATIC_COLLIDER = {
  friction: 0.6,
  restitution: 0.15,
} as const;

interface CarPhysicsBody {
  readonly body: RAPIER.RigidBody;
  readonly collider: RAPIER.Collider;

  lastMass: number;
}

export class RapierPhysicsWorld {
  private readonly world: RAPIER.World;

  private readonly components: GameComponents;

  private readonly scene: THREE.Scene;

  private readonly carBodies =
    new Map<EntityId, CarPhysicsBody>();

  /*
   * Rapier debug rendering.
   *
   * Rapier generates line vertices representing the actual
   * collision geometry used by the physics simulation.
   */
  private readonly debugGeometry =
    new THREE.BufferGeometry();

  private readonly debugMaterial =
    new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 1,
      depthTest: true,
    });

  private readonly debugLines =
    new THREE.LineSegments(
      this.debugGeometry,
      this.debugMaterial,
    );

  private debugVisible = false;

  private constructor(
    world: RAPIER.World,
    components: GameComponents,
    scene: THREE.Scene,
  ) {
    this.world = world;
    this.components = components;
    this.scene = scene;

    this.debugLines.name =
      'RapierPhysicsDebug';

    /*
     * Debug geometry changes constantly, so don't let Three.js
     * discard it because of an outdated bounding volume.
     */
    this.debugLines.frustumCulled =
      false;

    this.debugLines.visible =
      this.debugVisible;

    this.scene.add(
      this.debugLines,
    );
  }

  public static async create(
    scene: THREE.Scene,
    components: GameComponents,
  ): Promise<RapierPhysicsWorld> {
    await RAPIER.init();

    /*
     * For the current bumper-car prototype the gameplay
     * happens on the XZ plane.
     *
     * Gravity remains disabled until we decide to support
     * ramps, jumps or falling arenas.
     */
    const world =
      new RAPIER.World({
        x: 0,
        y: 0,
        z: 0,
      });

    const physics =
      new RapierPhysicsWorld(
        world,
        components,
        scene,
      );

    physics.createStaticGymColliders(
      scene,
    );

    return physics;
  }

  public createCar(
    entityId: EntityId,
  ): void {
    if (
      this.carBodies.has(
        entityId,
      )
    ) {
      return;
    }

    const transform =
      this.components.transforms.require(
        entityId,
      );

    const motion =
      this.components.motions.require(
        entityId,
      );

    const halfYaw =
      transform.yaw *
      0.5;

    const bodyDescription =
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(
          transform.positionX,
          0,
          transform.positionZ,
        )
        .setRotation({
          x: 0,
          y: Math.sin(halfYaw),
          z: 0,
          w: Math.cos(halfYaw),
        })
        /*
         * Car stays on the arena plane.
         */
        .enabledTranslations(
          true,
          false,
          true,
        )
        /*
         * Car can only rotate around Y.
         */
        .enabledRotations(
          false,
          true,
          false,
        )
        /*
         * Helps prevent tunneling when using boost.
         */
        .setCcdEnabled(true)
        .setCanSleep(false);

    const body =
      this.world.createRigidBody(
        bodyDescription,
      );

    const mass =
      Math.max(
        motion.mass,
        0.001,
      );

    const colliderDescription =
      RAPIER.ColliderDesc.cuboid(
        CAR_COLLIDER.halfWidth,
        CAR_COLLIDER.halfHeight,
        CAR_COLLIDER.halfLength,
      )
        .setTranslation(
          0,
          CAR_COLLIDER.centerY,
          0,
        )
        .setMass(
          mass,
        )
        .setFriction(
          CAR_COLLIDER.friction,
        )
        .setRestitution(
          CAR_COLLIDER.restitution,
        );

    const collider =
      this.world.createCollider(
        colliderDescription,
        body,
      );

    this.carBodies.set(
      entityId,
      {
        body,
        collider,
        lastMass: mass,
      },
    );
  }

  public step(
    deltaTime: number,
  ): void {
    this.world.timestep =
      deltaTime;

    /*
     * Gameplay controller -> Rapier.
     */
    for (
      const [
        entityId,
        physicsBody,
      ] of this.carBodies
    ) {
      this.pushGameplayStateToBody(
        entityId,
        physicsBody,
      );
    }

    /*
     * Resolve physics and collisions.
     */
    this.world.step();

    /*
     * Rapier -> ECS.
     */
    for (
      const [
        entityId,
        physicsBody,
      ] of this.carBodies
    ) {
      this.pullBodyStateToGameplay(
        entityId,
        physicsBody,
      );
    }
  }

  public updateDebugRender(): void {
    if (
      !this.debugVisible
    ) {
      return;
    }

    const buffers =
      this.world.debugRender();

    /*
     * Rapier returns the actual line vertices for all
     * colliders currently registered in the physics world.
     */
    this.debugGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        buffers.vertices,
        3,
      ),
    );

    /*
     * Rapier's debug colors are RGBA.
     */
    this.debugGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(
        buffers.colors,
        4,
      ),
    );

    this.debugGeometry
      .getAttribute('position')
      .needsUpdate = true;

    this.debugGeometry
      .getAttribute('color')
      .needsUpdate = true;

    this.debugGeometry.computeBoundingSphere();
  }

  public setDebugVisible(
    visible: boolean,
  ): void {
    this.debugVisible =
      visible;

    this.debugLines.visible =
      visible;

    /*
     * Generate geometry immediately when debug becomes visible.
     */
    if (
      visible
    ) {
      this.updateDebugRender();
    }
  }

  public get isDebugVisible(): boolean {
    return this.debugVisible;
  }

  public dispose(): void {
    this.scene.remove(
      this.debugLines,
    );

    this.debugGeometry.dispose();
    this.debugMaterial.dispose();

    this.carBodies.clear();

    this.world.free();
  }

  private pushGameplayStateToBody(
    entityId: EntityId,
    physicsBody: CarPhysicsBody,
  ): void {
    const motion =
      this.components.motions.require(
        entityId,
      );

    /*
     * For this first integration CarControllerSystem still
     * calculates the desired velocity.
     *
     * Rapier then resolves collision response.
     */
    physicsBody.body.setLinvel(
      {
        x: motion.velocityX,
        y: 0,
        z: motion.velocityZ,
      },
      true,
    );

    physicsBody.body.setAngvel(
      {
        x: 0,
        y: motion.angularVelocity,
        z: 0,
      },
      true,
    );

    /*
     * Runtime tuning may change mass.
     * Only update Rapier if the value actually changed.
     */
    const mass =
      Math.max(
        motion.mass,
        0.001,
      );

    if (
      Math.abs(
        mass -
          physicsBody.lastMass,
      ) >
      0.0001
    ) {
      physicsBody.collider.setMass(
        mass,
      );

      physicsBody.lastMass =
        mass;
    }
  }

  private pullBodyStateToGameplay(
    entityId: EntityId,
    physicsBody: CarPhysicsBody,
  ): void {
    const transform =
      this.components.transforms.require(
        entityId,
      );

    const motion =
      this.components.motions.require(
        entityId,
      );

    const position =
      physicsBody.body.translation();

    const rotation =
      physicsBody.body.rotation();

    const linearVelocity =
      physicsBody.body.linvel();

    const angularVelocity =
      physicsBody.body.angvel();

    transform.positionX =
      position.x;

    transform.positionY =
      0;

    transform.positionZ =
      position.z;

    transform.yaw =
      getYawFromQuaternion(
        rotation,
      );

    motion.velocityX =
      linearVelocity.x;

    motion.velocityY =
      0;

    motion.velocityZ =
      linearVelocity.z;

    motion.angularVelocity =
      angularVelocity.y;
  }

  private createStaticGymColliders(
    scene: THREE.Scene,
  ): void {
    /*
     * We need current world transforms before calculating
     * bounding boxes from Three.js objects.
     */
    scene.updateMatrixWorld(
      true,
    );

    scene.traverse(
      (object) => {
        if (
          !shouldCreateStaticCollider(
            object.name,
          )
        ) {
          return;
        }

        this.createStaticBoxFromObject(
          object,
        );
      },
    );
  }

  private createStaticBoxFromObject(
    object: THREE.Object3D,
  ): void {
    const bounds =
      new THREE.Box3().setFromObject(
        object,
      );

    if (
      bounds.isEmpty()
    ) {
      return;
    }

    const size =
      new THREE.Vector3();

    const center =
      new THREE.Vector3();

    bounds.getSize(
      size,
    );

    bounds.getCenter(
      center,
    );

    if (
      size.x <= 0 ||
      size.y <= 0 ||
      size.z <= 0
    ) {
      return;
    }

    const collider =
      RAPIER.ColliderDesc.cuboid(
        size.x * 0.5,
        size.y * 0.5,
        size.z * 0.5,
      )
        .setTranslation(
          center.x,
          center.y,
          center.z,
        )
        .setFriction(
          STATIC_COLLIDER.friction,
        )
        .setRestitution(
          STATIC_COLLIDER.restitution,
        );

    /*
     * Collider without an attached dynamic rigid body behaves
     * as static world geometry.
     */
    this.world.createCollider(
      collider,
    );
  }
}

function shouldCreateStaticCollider(
  objectName: string,
): boolean {
  if (
    objectName === 'NorthBoundary' ||
    objectName === 'SouthBoundary' ||
    objectName === 'EastBoundary' ||
    objectName === 'WestBoundary'
  ) {
    return true;
  }

  if (
    /^SlalomBlock_\d+$/.test(
      objectName,
    )
  ) {
    return true;
  }

  if (
    /^CrashDummy_\d+$/.test(
      objectName,
    )
  ) {
    return true;
  }

  return false;
}

function getYawFromQuaternion(
  rotation: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly w: number;
  },
): number {
  const sinYaw =
    2 *
    (
      rotation.w *
        rotation.y +
      rotation.x *
        rotation.z
    );

  const cosYaw =
    1 -
    2 *
      (
        rotation.y *
          rotation.y +
        rotation.z *
          rotation.z
      );

  return Math.atan2(
    sinYaw,
    cosYaw,
  );
}