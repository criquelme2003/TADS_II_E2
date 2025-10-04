import { Product } from '../../domain/entities/Product';
import { ProductRepository } from '../../domain/repositories/ProductRepository';

export class GetProductById {
    constructor(private productRepository: ProductRepository) { }

    async execute(id: number): Promise<Product> {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }
}
