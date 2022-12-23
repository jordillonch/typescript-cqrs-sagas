import { SagaState } from './saga';

export interface SagaStateRepository {
  save(sagaState: SagaState);

  findBy(id: any): SagaState;

  all(): SagaState[];

  delete(id: any);
}
