import { Bus } from './saga_bus_synchronous';
import { Effect } from '../cqrs/effect/effect';

export class SimpleBusProcessor {
  constructor(private buses: Bus[]) {}

  publish(effects: Effect[]) {
    this.buses.forEach((bus) => {
      effects.forEach((effect) => {
        bus.publish(effect);
      });
    });
  }

  process() {
    while (this.busesHasPendingEffects()) {
      const effectsDuringProcessing: Effect[] = [];
      this.buses.forEach((bus) => {
        const effects = bus.process();
        effectsDuringProcessing.push(...effects);
      });
      effectsDuringProcessing.forEach((effect) => {
        this.buses.forEach((bus) => {
          bus.publish(effect);
        });
      });
    }
  }

  busesHasPendingEffects(): boolean {
    return (
      this.buses
        .map((bus) => bus.countPendingEffects())
        .reduce((a, b) => a + b, 0) > 0
    );
  }
}
