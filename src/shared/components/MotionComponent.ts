export interface MotionComponent {
  velocityX: number;
  velocityY: number;
  velocityZ: number;

  angularVelocity: number;

  mass: number;
}

export function createMotionComponent(
  mass = 1,
): MotionComponent {
  return {
    velocityX: 0,
    velocityY: 0,
    velocityZ: 0,

    angularVelocity: 0,

    mass,
  };
}

export function getHorizontalSpeed(
  motion: MotionComponent,
): number {
  return Math.hypot(
    motion.velocityX,
    motion.velocityZ,
  );
}

export function applyHorizontalImpulse(
  motion: MotionComponent,
  impulseX: number,
  impulseZ: number,
): void {
  if (motion.mass <= 0) {
    return;
  }

  const inverseMass = 1 / motion.mass;

  motion.velocityX += impulseX * inverseMass;
  motion.velocityZ += impulseZ * inverseMass;
}