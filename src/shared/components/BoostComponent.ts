export interface BoostComponent {
  /**
   * Current available boost energy.
   *
   * Range:
   * 0 -> maxEnergy
   */
  energy: number;

  maxEnergy: number;

  /**
   * Energy consumed every second while boosting.
   */
  drainPerSecond: number;

  /**
   * Energy restored every second after the recharge delay.
   */
  rechargePerSecond: number;

  /**
   * Time without boosting before recharge begins.
   */
  rechargeDelay: number;

  /**
   * Runtime countdown.
   *
   * This is simulation state and therefore must exist on both
   * client and authoritative server.
   */
  rechargeDelayRemaining: number;
}

export interface BoostConfig {
  readonly maxEnergy: number;
  readonly drainPerSecond: number;
  readonly rechargePerSecond: number;
  readonly rechargeDelay: number;
}

export function createBoostComponent(
  config: BoostConfig,
): BoostComponent {
  return {
    energy: config.maxEnergy,
    maxEnergy: config.maxEnergy,

    drainPerSecond: config.drainPerSecond,
    rechargePerSecond: config.rechargePerSecond,

    rechargeDelay: config.rechargeDelay,
    rechargeDelayRemaining: 0,
  };
}