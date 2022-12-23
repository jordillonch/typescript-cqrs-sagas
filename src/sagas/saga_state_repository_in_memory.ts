import { SagaStateRepository } from './saga_state_repository';
import { SagaState } from './saga';

export class SagaStateRepositoryInMemory implements SagaStateRepository {
  private states: Map<any, SagaState> = new Map();

  all(): SagaState[] {
    return [...this.states.values()];
  }

  delete(id: any) {
    this.states.delete(id);
  }

  findBy(id: any): SagaState {
    return this.states.get(id);
  }

  save(sagaState: SagaState) {
    this.states.set(sagaState.id, sagaState);
  }
}
