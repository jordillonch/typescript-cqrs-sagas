/* eslint-disable @typescript-eslint/ban-types */

// eslint-disable-next-line @typescript-eslint/no-empty-interface
import {
  AnySagaState,
  SagaOutput,
  SagaState,
  TypedSagaStateCreator,
} from '../../sagas/saga';

export interface Effect<T = any, ET = any> {
  type: T;
  effectType: ET;
}

export function createEffect<
  P = void,
  T extends string = string,
  ET extends string = string,
>(type: T, effectType: ET): PayloadEffectCreator<P, T, ET>;

export function createEffect(
  type: string,
  effectType: string,
  prepareEffect?: Function,
): any {
  function effectCreator(...args: any[]) {
    if (prepareEffect) {
      const prepared = prepareEffect(...args);
      if (!prepared) {
        throw new Error('prepareEffect did not return an object');
      }

      return {
        type,
        effectType,
        payload: prepared.payload,
        ...('meta' in prepared && { meta: prepared.meta }),
        ...('error' in prepared && { error: prepared.error }),
      };
    }
    return { type, effectType, payload: args[0] };
  }

  effectCreator.toString = () => `${effectType}.${type}`;

  effectCreator.type = type;

  effectCreator.match = (effect: Effect<unknown>): effect is PayloadEffect =>
    effect.type === type && effect.effectType === effectType;

  return effectCreator;
}

export type PayloadEffectCreator<
  P = void,
  T extends string = string,
  ET extends string = string,
  PA extends PrepareEffect<P> | void = void,
> = EffectCreatorWithPayload<P, T, ET>;

export type PrepareEffect<P> =
  | ((...args: any[]) => { payload: P })
  | ((...args: any[]) => { payload: P; meta: any })
  | ((...args: any[]) => { payload: P; error: any })
  | ((...args: any[]) => { payload: P; meta: any; error: any });

export interface EffectCreatorWithPayload<
  P,
  T extends string = string,
  ET extends string = string,
> extends BaseEffectCreator<P, T, ET> {
  (payload: P): PayloadEffect<P, T, ET>;
}

export interface BaseEffectCreator<
  P,
  T extends string,
  ET extends string,
  M = never,
  E = never,
> {
  type: T;
  effectType: ET;
  match: (
    effect: Effect<unknown, unknown>,
  ) => effect is PayloadEffect<P, T, ET, M, E>;
}

export type PayloadEffect<
  P = void,
  T extends string = string,
  ET extends string = string,
  M = never,
  E = never,
> = {
  payload: P;
  type: T;
  effectType: ET;
} & ([M] extends [never]
  ? {}
  : {
      meta: M;
    }) &
  ([E] extends [never]
    ? {}
    : {
        error: E;
      });

export interface TypedEffectCreator<
  Type extends string,
  EffectType extends string,
> {
  (...args: any[]): Effect<Type, EffectType>;

  type: Type;
  effectType: EffectType;
}

/**
 * An Effect type which accepts any other properties.
 * This is mainly for the use of the `Reducer` type.
 * This is not part of `Effect` itself to prevent types that extend `Effect` from
 * having an index signature.
 */
export interface AnyEffect extends Effect {
  // Allows any extra properties to be defined in an effect.
  [extraProps: string]: any;
}

export type CaseReducerStateless<A extends Effect = AnyEffect> = (
  action: A,
) => SagaOutput;

export type CaseReducerStateful<
  S extends SagaState = AnySagaState,
  A extends Effect = AnyEffect,
> = (state: S, action: A) => SagaOutput;

export function addFlow<
  EffectCreator extends TypedEffectCreator<string, string>,
>(on: EffectCreator, do_: CaseReducerStateless<ReturnType<EffectCreator>>) {
  return { on: on, do: do_ };
}

export function addFlowState<
  SagaStateCreator extends TypedSagaStateCreator<string>,
  EffectCreator extends TypedEffectCreator<string, string>,
>(
  in_: SagaStateCreator,
  on: EffectCreator,
  do_: CaseReducerStateful<
    ReturnType<SagaStateCreator>,
    ReturnType<EffectCreator>
  >,
) {
  return { in: in_, on: on, do: do_ };
}
