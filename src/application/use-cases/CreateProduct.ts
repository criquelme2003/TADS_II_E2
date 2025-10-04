import { Product, ProductData } from '../../domain/entities/Product';
import { ProductRepository } from '../../domain/repositories/ProductRepository';

export class CreateProduct {
    constructor(private productRepository: ProductRepository) { }

    async execute(productData: ProductData): Promise<Product> {
        const product = new Product(productData);
        product.validate();
        return await this.productRepository.create(product);
    }
}
