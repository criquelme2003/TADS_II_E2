import { Product, ProductData } from '../../domain/entities/Product';
import { ProductRepository } from '../../domain/repositories/ProductRepository';

export class InMemoryProductRepository implements ProductRepository {
    private products: Product[] = [];
    private nextId = 1;

    private clone(product: Product): Product {
        const data = JSON.parse(JSON.stringify(product)) as ProductData;
        return new Product(data);
    }

    private findActiveIndex(id: number): number {
        const index = this.products.findIndex(product => product.id === id && !product.deletedAt);
        if (index === -1) {
            throw new Error('Product not found');
        }
        return index;
    }

    async create(product: Product): Promise<Product> {
        const now = new Date().toISOString();
        const stored = new Product({
            ...product,
            id: this.nextId++,
            createdAt: now,
            updatedAt: now,
            version: 1,
            deletedAt: undefined
        });
        this.products.push(stored);
        return this.clone(stored);
    }

    async findAll(): Promise<Product[]> {
        return this.products
            .filter(product => !product.deletedAt)
            .map(product => this.clone(product));
    }

    async findById(id: number): Promise<Product | undefined> {
        const found = this.products.find(product => product.id === id && !product.deletedAt);
        return found ? this.clone(found) : undefined;
    }

    async update(id: number, product: Product): Promise<Product> {
        const index = this.findActiveIndex(id);
        const existing = this.products[index];

        const updated = new Product({
            ...existing,
            ...product,
            id,
            updatedAt: new Date().toISOString(),
            version: (existing.version || 1) + 1
        });
        updated.validate();

        this.products[index] = updated;
        return this.clone(updated);
    }

    async partialUpdate(id: number, updates: Partial<Product>): Promise<Product> {
        const index = this.findActiveIndex(id);
        const existing = this.products[index];

        const mergedSubcategory = updates.subcategory
            ? {
                  ...existing.subcategory,
                  ...updates.subcategory,
                  category: updates.subcategory.category
                      ? {
                            ...existing.subcategory.category,
                            ...updates.subcategory.category
                        }
                      : existing.subcategory.category
              }
            : existing.subcategory;

        const mergedData: ProductData = {
            ...existing,
            ...updates,
            id,
            updatedAt: new Date().toISOString(),
            version: (existing.version || 1) + 1,
            subcategory: mergedSubcategory
        };

        const updated = new Product(mergedData);
        updated.validate();

        this.products[index] = updated;
        return this.clone(updated);
    }

    async delete(id: number): Promise<Product> {
        const index = this.findActiveIndex(id);
        const existing = this.products[index];
        const toReturn = this.clone(existing);

        this.products[index] = new Product({
            ...existing,
            deletedAt: new Date().toISOString()
        });

        return toReturn;
    }
}
