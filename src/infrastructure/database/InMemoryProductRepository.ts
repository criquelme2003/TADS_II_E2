import { Product } from '../../domain/entities/Product';
import { ProductRepository } from '../../domain/repositories/ProductRepository';

export class InMemoryProductRepository implements ProductRepository {
    private products: Product[] = [];
    private nextId: number = 1;

    constructor() {
        this.seedData();
    }

    private seedData(): void {
        this.products = [
            new Product({
                id: 1,
                name: 'Zapatilla Running Pro',
                description: 'Zapatilla profesional para running',
                price: 89.99,
                stock: 25,
                size: '42',
                color: 'Negro/Rojo',
                brand: 'SportMax',
                subcategory: {
                    id: 101,
                    name: 'Running',
                    description: 'Calzado especializado para correr',
                    category: {
                        id: 1001,
                        name: 'Deportivo',
                        description: 'Calzado para actividades deportivas'
                    }
                }
            }),
            new Product({
                id: 2,
                name: 'Botín Clásico Premium',
                description: 'Botín de cuero para uso formal',
                price: 129.99,
                stock: 15,
                size: '41',
                color: 'Marrón',
                brand: 'ElegantShoes',
                subcategory: {
                    id: 102,
                    name: 'Botines',
                    description: 'Botines para uso formal y casual',
                    category: {
                        id: 1002,
                        name: 'Formal',
                        description: 'Calzado para ocasiones formales'
                    }
                }
            })
        ];
        this.nextId = 3;
    }

    async create(product: Product): Promise<Product> {
        const newProduct = new Product({ ...(product as any), id: this.nextId++ });
        this.products.push(newProduct);
        return newProduct;
    }

    async findAll(): Promise<Product[]> {
        return this.products;
    }

    async findById(id: number): Promise<Product | undefined> {
        return this.products.find(p => p.id === id);
    }

    async update(id: number, product: Product): Promise<Product> {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('Product not found');
        }
        const updated = new Product({ ...(product as any), id });
        this.products[index] = updated;
        return updated;
    }

    async partialUpdate(id: number, updates: Partial<Product>): Promise<Product> {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('Product not found');
        }
        // Merge existing product data with updates and create a new Product instance
        const existing = this.products[index];
        const merged = Object.assign({}, existing, updates);
        const updated = new Product(merged as any);
        this.products[index] = updated;
        return updated;
    }

    async delete(id: number): Promise<Product> {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('Product not found');
        }
        const deleted = this.products[index];
        this.products.splice(index, 1);
        return deleted;
    }
}
