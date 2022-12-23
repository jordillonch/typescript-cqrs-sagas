import { AssociationRepository } from './association_repository';

export class AssociationRepositoryInMemory implements AssociationRepository {
  private associations: Map<any, Set<any>> = new Map();

  byId(associationId: any): any[] {
    return [...this.associations.get(associationId)] || [];
  }

  delete(id: any) {
    this.associations.delete(id);
  }

  save(associationId: any, entityId: any) {
    if (!this.associations.has(associationId)) {
      this.associations.set(associationId, new Set());
    }
    this.associations.get(associationId).add(entityId);
  }
}
