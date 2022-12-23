/* eslint-disable @typescript-eslint/ban-types */
import {
  CaseReducerStateful,
  CaseReducerStateless,
  Effect,
  TypedEffectCreator,
} from '../cqrs/effect/effect';
import { createCommand } from '../cqrs/commands/command';

export interface SagaOutput {
  state: SagaState;
  effects: Effect[];
}

type SagaNoParametersHandler = () => SagaOutput;

type SagaNoParametersNoOutputHandler = () => void;

export type SagaStatelessfulHandler<E extends Effect> = {
  type: 'STATELESS';
  handler: (effect: E) => SagaOutput;
};

export type SagaStatefulHandler<E extends Effect> = {
  type: 'STATEFUL';
  handler: (state: SagaState, effect: E) => SagaOutput;
  sagaStateType: string;
};

export type SagaHandler<E extends Effect> =
  | SagaStatelessfulHandler<E>
  | SagaStatefulHandler<E>;
// | SagaNoParametersHandler
// | SagaNoParametersNoOutputHandler

export const isSagaStatefulHandler = (handler: SagaHandler<any>): boolean => {
  return handler.type === 'STATEFUL';
};

export interface SagaFlowStateless<
  EffectCreator extends TypedEffectCreator<string, string>,
> {
  on: EffectCreator;
  do: CaseReducerStateless<ReturnType<EffectCreator>>;
}

export interface SagaFlowStateful<
  SagaStateCreator extends TypedSagaStateCreator<string>,
  EffectCreator extends TypedEffectCreator<string, string>,
> {
  in: SagaStateCreator;
  on: EffectCreator;
  do: CaseReducerStateful<
    ReturnType<SagaStateCreator>,
    ReturnType<EffectCreator>
  >;
}

export type SagaFlow = SagaFlowStateless<any> | SagaFlowStateful<any, any>;

export const isSagaFlowStateful = (
  flow: SagaFlow,
): flow is SagaFlowStateful<any, any> => {
  return (flow as SagaFlowStateful<any, any>).in !== undefined;
};

export abstract class Saga {
  private sagaHandlers: Map<string, SagaHandler<any>[]> = new Map();

  handlers(): Map<string, SagaHandler<any>[]> {
    return this.sagaHandlers;
  }

  protected constructor(flow: SagaFlow[]) {
    flow.forEach((flow) => {
      const type = flow.on.type;
      const handlers = this.sagaHandlers.get(type) || [];
      if (isSagaFlowStateful(flow)) {
        handlers.push({
          type: 'STATEFUL',
          handler: flow.do,
          sagaStateType: flow.in.type,
        });
      } else {
        handlers.push({
          type: 'STATELESS',
          handler: flow.do,
        });
      }
      this.sagaHandlers.set(type, handlers);
    });
  }
}

export interface SagaState<T = any> {
  type: T;
  id: any;
}

export function createSagaState<P = void, T extends string = string>(
  type: T,
): PayloadSagaStateCreator<P, T>;

export function createSagaState(
  type: string,
  prepareSagaState?: Function,
): any {
  function effectCreator(id: any, ...args: any[]) {
    if (prepareSagaState) {
      const prepared = prepareSagaState(...args);
      if (!prepared) {
        throw new Error('prepareSagaState did not return an object');
      }

      return {
        type,
        id,
        payload: prepared.payload,
        ...('meta' in prepared && { meta: prepared.meta }),
        ...('error' in prepared && { error: prepared.error }),
      };
    }
    return { type, id, payload: args[0] };
  }

  effectCreator.toString = () => `${type}`;

  effectCreator.type = type;

  effectCreator.match = (
    effect: SagaState<unknown>,
  ): effect is PayloadSagaState => effect.type === type;

  return effectCreator;
}

export type PayloadSagaStateCreator<
  P = void,
  T extends string = string,
  PA extends PrepareSagaState<P> | void = void,
> = SagaStateCreatorWithPayload<P, T>;

export type PrepareSagaState<P> =
  | ((...args: any[]) => { payload: P })
  | ((...args: any[]) => { payload: P; meta: any })
  | ((...args: any[]) => { payload: P; error: any })
  | ((...args: any[]) => { payload: P; meta: any; error: any });

export interface SagaStateCreatorWithPayload<P, T extends string = string>
  extends BaseSagaStateCreator<P, T> {
  (id: any, payload: P): PayloadSagaState<P, T>;
}

export interface BaseSagaStateCreator<
  P,
  T extends string,
  M = never,
  E = never,
> {
  type: T;
  id: any;
  match: (action: SagaState<unknown>) => action is PayloadSagaState<P, T, M, E>;
}

export type PayloadSagaState<
  P = void,
  T extends string = string,
  M = never,
  E = never,
> = {
  payload: P;
  type: T;
  id: any;
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

export interface TypedSagaStateCreator<Type extends string> {
  (...args: any[]): SagaState<Type>;

  type: Type;
}

/**
 * An SagaState type which accepts any other properties.
 * This is mainly for the use of the `Reducer` type.
 * This is not part of `SagaState` itself to prevent types that extend `SagaState` from
 * having an index signature.
 */
export interface AnySagaState extends SagaState {
  // Allows any extra properties to be defined in an effect.
  [extraProps: string]: any;
}

export const Associate = createCommand<{ associationId: any; entityId: any }>(
  'ASSOCIATE',
);
