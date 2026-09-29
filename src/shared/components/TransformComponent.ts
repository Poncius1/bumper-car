export interface TransformComponent {
  positionX: number;
  positionY: number;
  positionZ: number;

  previousPositionX: number;
  previousPositionY: number;
  previousPositionZ: number;

  yaw: number;
  previousYaw: number;
}

export function createTransformComponent(
  positionX = 0,
  positionY = 0,
  positionZ = 0,
  yaw = 0,
): TransformComponent {
  return {
    positionX,
    positionY,
    positionZ,

    previousPositionX: positionX,
    previousPositionY: positionY,
    previousPositionZ: positionZ,

    yaw,
    previousYaw: yaw,
  };
}

export function beginTransformSimulationStep(
  transform: TransformComponent,
): void {
  transform.previousPositionX = transform.positionX;
  transform.previousPositionY = transform.positionY;
  transform.previousPositionZ = transform.positionZ;

  transform.previousYaw = transform.yaw;
}