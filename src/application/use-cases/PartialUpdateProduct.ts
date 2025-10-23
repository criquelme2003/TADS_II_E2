import { Product } from '../../domain/entities/Product';
import { ProductRepository } from '../../domain/repositories/ProductRepository';

export class PartialUpdateProduct {
    constructor(private productRepository: ProductRepository) { }

    async execute(id: number, updates: Partial<Product>, userId?: string): Promise<Product> {
        const updatesWithUser = {
            ...updates,
            updatedBy: userId || 'anonymous',
        };

        delete (updatesWithUser as any).id;
        delete (updatesWithUser as any).createdAt;
        delete (updatesWithUser as any).createdBy;
        delete (updatesWithUser as any).deletedAt;
        delete (updatesWithUser as any).version;

        return await this.productRepository.partialUpdate(id, updatesWithUser);
    }
}