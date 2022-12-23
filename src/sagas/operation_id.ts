import { v4 as uuid } from 'uuid';

export type OperationId = {
  operationId: string;
};
export const newOperationId = (): OperationId => ({ operationId: uuid() });
