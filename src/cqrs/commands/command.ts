import { createEffect, Effect, PayloadEffectCreator } from '../effect/effect';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Command<T> extends Effect<T, 'COMMAND'> {}

export function createCommand<P = void, T extends string = string>(
  type: T,
): PayloadEffectCreator<P, T, 'COMMAND'>;

export function createCommand(type: string): any {
  return createEffect(type, 'COMMAND');
}
