import { Product } from '../entities/Product';

export interface ProductRepository {
    create(product: Product): Promise<Product>;
    findAll(): Promise<Product[]>;
    findById(id: number): Promise<Product | undefined>;
    update(id: number, product: Product): Promise<Product>;
    partialUpdate(id: number, updates: Partial<Product>): Promise<Product>;
    delete(id: number): Promise<Product>;
}
