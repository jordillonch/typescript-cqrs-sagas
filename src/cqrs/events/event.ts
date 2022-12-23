import { createEffect, Effect, PayloadEffectCreator } from '../effect/effect';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Event<T> extends Effect<T, 'EVENT'> {}

export function createEvent<P = void, T extends string = string>(
  type: T,
): PayloadEffectCreator<P, T>;

export function createEvent(type: string): any {
  return createEffect(type, 'EVENT');
}
