import { newOperationId, OperationId } from './operation_id';
import { createCommand } from '../cqrs/commands/command';
import { createEvent } from '../cqrs/events/event';
import { Associate, createSagaState, Saga } from './saga';
import { addFlow, addFlowState } from '../cqrs/effect/effect';
import { SagaBusSynchronous } from './saga_bus_synchronous';
import { SimpleBusProcessor } from './simple-bus.processor';

describe('Saga simple test', () => {
  it('should call the saga and return the result', () => {
    const saga = new FooSaga('FOO');
    const sagaBus = new SagaBusSynchronous();
    sagaBus.register(saga);
    const bus = new SimpleBusProcessor([sagaBus]);

    const firstEffect = FirstEffect({ id: newOperationId() });
    const secondEffect = SecondEffect({ id: firstEffect.payload.id });
    const thirdEffect = ThirdEffect({ id: firstEffect.payload.id });
    const finalEffect = FinalEffect({ id: firstEffect.payload.id });
    bus.publish([firstEffect]);
    bus.process();
    expect(sagaBus.store).toStrictEqual([
      firstEffect,
      Associate({
        associationId: firstEffect.payload.id,
        entityId: firstEffect.payload.id,
      }),
      secondEffect,
      thirdEffect,
      finalEffect,
    ]);
  });
});

class FooSaga extends Saga {
  constructor(private aValue: string) {
    super([
      addFlow(FirstEffect, (effect) => {
        const nextState = InitialState(effect.payload.id, { someData: 'foo' });
        return {
          state: nextState,
          effects: [
            Associate({
              associationId: effect.payload.id,
              entityId: nextState.id,
            }),
            SecondEffect({ id: effect.payload.id }),
          ],
        };
      }),
      addFlowState(InitialState, SecondEffect, (state, effect) => ({
        state: FinalState(effect.payload.id, { someData: 'foo' }),
        effects: [ThirdEffect({ id: effect.payload.id })],
      })),
      addFlowState(RandomState, SecondEffect, (state, effect) => {
        throw new Error('Error');
      }),
      addFlowState(FinalState, ThirdEffect, (state, effect) => ({
        state,
        effects: [FinalEffect({ id: effect.payload.id })],
      })),
    ]);
  }
}

const FirstEffect = createCommand<{ id: OperationId }>('FIRST_EFFECT');
const SecondEffect = createEvent<{ id: OperationId }>('SECOND_EFFECT');
const ThirdEffect = createEvent<{ id: OperationId }>('THIRD_EFFECT');
const FinalEffect = createEvent<{ id: OperationId }>('FINAL_EFFECT');

const InitialState = createSagaState<{ someData: string }>('INITIAL_STATE');
const RandomState = createSagaState<{ someData: string }>('RANDOM_STATE');
const FinalState = createSagaState<{ someData: string }>('FINAL_STATE');
