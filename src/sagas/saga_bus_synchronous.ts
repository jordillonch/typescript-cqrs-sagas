import { Saga, SagaHandler, SagaState } from './saga';
import { Effect } from '../cqrs/effect/effect';
import { Type } from '../cqrs/type';
import { SagaHandlerProcessor } from './saga_handler_processor';

export interface Bus {
  publish(effect: Effect);

  countPendingEffects(): number;

  process(): Effect[];
}

export interface SagaBus extends Bus {
  register(saga: Saga): void;
}

export class SagaBusSynchronous implements SagaBus {
  private readonly handlers: Map<string, SagaHandler<any>[]> = new Map();
  private readonly processor: SagaHandlerProcessor = new SagaHandlerProcessor();
  private readonly enqueuedEffects: Effect[] = [];
  store: Effect[] = [];

  publish(effect: Effect) {
    this.enqueuedEffects.push(effect);
  }

  process(): Effect[] {
    const effectsDuringProcessing: Effect[] = [];
    while (this.enqueuedEffects.length > 0) {
      const effect = this.enqueuedEffects.shift();
      const handlers = this.handlers.get(effect.type);
      if (handlers) {
        handlers.forEach((handler) => {
          const effects = this.processor.process(handler, effect);
          effectsDuringProcessing.push(...effects);
        });
      }
      this.store.push(effect);
    }
    return effectsDuringProcessing;
  }

  register(saga: Saga) {
    saga.handlers().forEach((handlers, type) => {
      const existingHandlers = this.handlers.get(type) || [];
      this.handlers.set(type, [...existingHandlers, ...handlers]);
    });
  }

  countPendingEffects = (): number => this.enqueuedEffects.length;
}
