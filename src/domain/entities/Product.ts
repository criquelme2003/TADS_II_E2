export interface Category {
    id: number;
    name: string;
    description: string;
}

export interface Subcategory {
    id: number;
    name: string;
    description: string;
    category: Category;
}

export interface ProductData {
    id?: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    size: string;
    color: string;
    brand: string;
    subcategory: Subcategory;
}

export class Product {
    id?: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    size: string;
    color: string;
    brand: string;
    subcategory: Subcategory;

    constructor(data: ProductData) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.price = data.price;
        this.stock = data.stock;
        this.size = data.size;
        this.color = data.color;
        this.brand = data.brand;
        this.subcategory = data.subcategory;
    }

    validate(): boolean {
        if (!this.name || this.name.trim() === '') {
            throw new Error('Product name is required');
        }
        if (!this.price || this.price <= 0) {
            throw new Error('Product price must be greater than 0');
        }
        if (!this.subcategory) {
            throw new Error('Subcategory is required');
        }
        return true;
    }
}
