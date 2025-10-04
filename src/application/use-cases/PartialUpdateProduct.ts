import { Product } from '../../domain/entities/Product';
import { ProductRepository } from '../../domain/repositories/ProductRepository';

export class PartialUpdateProduct {
    constructor(private productRepository: ProductRepository) { }

    async execute(id: number, updates: Partial<Product>): Promise<Product> {
        return await this.productRepository.partialUpdate(id, updates);
    }
}
