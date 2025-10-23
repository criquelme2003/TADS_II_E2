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
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
    deletedAt?: string;
    version?: number;
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
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
    deletedAt?: string;
    version?: number;

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
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.createdBy = data.createdBy;
        this.updatedBy = data.updatedBy;
        this.deletedAt = data.deletedAt;
        this.version = data.version;
    }

    validate(): boolean {
        if (!this.name || this.name.trim() === '') {
            throw new Error('Product name is required');
        }
        if (!this.price || this.price <= 0) {
            throw new Error('Product price must be greater than 0');
        }
        if (this.stock < 0) {
            throw new Error('Product stock cannot be negative');
        }
        if (!this.subcategory) {
            throw new Error('Subcategory is required');
        }
        return true;
    }
}
