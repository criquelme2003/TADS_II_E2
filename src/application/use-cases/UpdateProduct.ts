import { Product, ProductData } from '../../domain/entities/Product';
import { ProductRepository } from '../../domain/repositories/ProductRepository';

export class UpdateProduct {
    constructor(private productRepository: ProductRepository) { }

    async execute(id: number, productData: ProductData): Promise<Product> {
        const product = new Product({ ...productData, id });
        product.validate();
        return await this.productRepository.update(id, product);
    }
}
