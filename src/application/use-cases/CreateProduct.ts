import { Product, ProductData } from '../../domain/entities/Product';
import { ProductRepository } from '../../domain/repositories/ProductRepository';

export class CreateProduct {
    constructor(private productRepository: ProductRepository) { }

    async execute(productData: ProductData, userId?: string): Promise<Product> {
        const product = new Product({
            ...productData,
            createdBy: userId || 'anonymous',
            updatedBy: userId || 'anonymous',
        });
        product.validate();
        return await this.productRepository.create(product);
    }
}