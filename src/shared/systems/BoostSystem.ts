import type { BoostComponent } from '../components/BoostComponent';
import type { PlayerInputComponent } from '../components/PlayerInputComponent';

import type { EntityId } from '../ecs/Entity';
import type { GameComponents } from '../ecs/GameComponents';

const MIN_BOOST_ENERGY = 0.001;

export class BoostSystem {
  private readonly components: GameComponents;

  public constructor(
    components: GameComponents,
  ) {
    this.components = components;
  }

  public update(
    deltaTime: number,
  ): void {
    for (
      const [
        entityId,
        boost,
      ] of this.components.boosts.entries()
    ) {
      this.updateBoost(
        entityId,
        boost,
        deltaTime,
      );
    }
  }

  private updateBoost(
    entityId: EntityId,
    boost: BoostComponent,
    deltaTime: number,
  ): void {
    const input =
      this.components.playerInputs.get(
        entityId,
      );

    const carState =
      this.components.carStates.get(
        entityId,
      );

    if (
      input === undefined ||
      carState === undefined
    ) {
      return;
    }

    const wantsBoost =
      shouldRequestBoost(input);

    const hasEnergy =
      boost.energy >
      MIN_BOOST_ENERGY;

    const canBoost =
      wantsBoost &&
      hasEnergy;

    carState.isBoosting =
      canBoost;

    if (canBoost) {
      consumeBoostEnergy(
        boost,
        deltaTime,
      );

      return;
    }

    rechargeBoostEnergy(
      boost,
      deltaTime,
    );
  }
}

function shouldRequestBoost(
  input: PlayerInputComponent,
): boolean {
  return (
    input.boost &&
    input.throttle > 0
  );
}

function consumeBoostEnergy(
  boost: BoostComponent,
  deltaTime: number,
): void {
  boost.energy =
    Math.max(
      0,
      boost.energy -
        boost.drainPerSecond *
          deltaTime,
    );

  boost.rechargeDelayRemaining =
    boost.rechargeDelay;
}

function rechargeBoostEnergy(
  boost: BoostComponent,
  deltaTime: number,
): void {
  if (
    boost.rechargeDelayRemaining > 0
  ) {
    boost.rechargeDelayRemaining =
      Math.max(
        0,
        boost.rechargeDelayRemaining -
          deltaTime,
      );

    return;
  }

  if (
    boost.energy >=
    boost.maxEnergy
  ) {
    return;
  }

  boost.energy =
    Math.min(
      boost.maxEnergy,
      boost.energy +
        boost.rechargePerSecond *
          deltaTime,
    );
}