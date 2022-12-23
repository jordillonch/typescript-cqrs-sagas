import {
  isSagaStatefulHandler,
  SagaHandler,
  SagaState,
  SagaStatefulHandler,
  SagaStatelessfulHandler,
} from './saga';
import { Effect } from '../cqrs/effect/effect';
import { SagaStateRepository } from './saga_state_repository';
import { AssociationRepository } from './association_repository';
import { SagaStateRepositoryInMemory } from './saga_state_repository_in_memory';
import { AssociationRepositoryInMemory } from './association_repository_in_memory';

export class SagaHandlerProcessor {
  private stateRepository: SagaStateRepository =
    new SagaStateRepositoryInMemory();
  private associationRepository: AssociationRepository =
    new AssociationRepositoryInMemory();

  process(handler: SagaHandler<any>, effect: Effect): Effect[] {
    if (isSagaStatefulHandler(handler)) {
      // here we would use a custom mapper
      const states = this.allInstancesMapper(effect);
      return states.flatMap((state) => {
        const isSameSagaStateType =
          state.type === (handler as SagaStatefulHandler<any>).sagaStateType;
        if (!isSameSagaStateType) {
          return [];
        } else {
          const { state: newState, effects } = handler.handler(state, effect);
          this.stateRepository.save(newState);
          return effects;
        }
      });
    } else {
      const { state, effects } = (
        handler as SagaStatelessfulHandler<any>
      ).handler(effect);
      if (state !== undefined) {
        this.stateRepository.save(state);
      }
      return effects;
    }
  }

  private allInstancesMapper(effect: Effect): SagaState[] {
    // FIXME: this just returns ALL states (just let it work...)
    return this.stateRepository.all();
  }
}
