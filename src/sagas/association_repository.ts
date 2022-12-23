export interface AssociationRepository {
  save(associationId: any, entityId: any);

  byId(associationId: any): any[];

  delete(id: any);
}
