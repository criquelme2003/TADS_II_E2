import { PrismaClient } from '@prisma/client';
import { Product } from '../../domain/entities/Product';
import { ProductRepository } from '../../domain/repositories/ProductRepository';

export class PrismaProductRepository implements ProductRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async create(product: Product): Promise<Product> {
        const created = await this.prisma.product.create({
            data: {
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                size: product.size,
                color: product.color,
                brand: product.brand,
                subcategoryId: product.subcategory.id,
                createdBy: product.createdBy || 'anonymous',
                updatedBy: product.createdBy || 'anonymous',
            },
            include: {
                subcategory: {
                    include: {
                        category: true,
                    },
                },
            },
        });

        return this.mapToProduct(created);
    }

    async findAll(): Promise<Product[]> {
        const products = await this.prisma.product.findMany({
            where: {
                deletedAt: null, // Solo productos no eliminados (soft delete)
            },
            include: {
                subcategory: {
                    include: {
                        category: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return products.map(this.mapToProduct);
    }

    async findById(id: number): Promise<Product | undefined> {
        const product = await this.prisma.product.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                subcategory: {
                    include: {
                        category: true,
                    },
                },
            },
        });

        return product ? this.mapToProduct(product) : undefined;
    }

    async update(id: number, product: Product): Promise<Product> {
        const existing = await this.prisma.product.findUnique({ where: { id } });
        if (!existing) {
            throw new Error('Product not found');
        }

        const updated = await this.prisma.product.update({
            where: { id },
            data: {
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                size: product.size,
                color: product.color,
                brand: product.brand,
                subcategoryId: product.subcategory.id,
                updatedBy: product.updatedBy || 'anonymous',
                version: existing.version + 1, // Incrementar versión
            },
            include: {
                subcategory: {
                    include: {
                        category: true,
                    },
                },
            },
        });

        return this.mapToProduct(updated);
    }

    async partialUpdate(id: number, updates: Partial<Product>): Promise<Product> {
        const existing = await this.prisma.product.findUnique({ where: { id } });
        if (!existing) {
            throw new Error('Product not found');
        }

        // Filtrar solo campos permitidos (NO permitir cambiar id, createdAt, createdBy)
        const allowedUpdates: any = {};

        if (updates.name !== undefined) allowedUpdates.name = updates.name;
        if (updates.description !== undefined) allowedUpdates.description = updates.description;
        if (updates.price !== undefined) allowedUpdates.price = updates.price;
        if (updates.stock !== undefined) allowedUpdates.stock = updates.stock;
        if (updates.size !== undefined) allowedUpdates.size = updates.size;
        if (updates.color !== undefined) allowedUpdates.color = updates.color;
        if (updates.brand !== undefined) allowedUpdates.brand = updates.brand;
        if (updates.subcategory?.id !== undefined) {
            allowedUpdates.subcategoryId = updates.subcategory.id;
        }

        // Siempre actualizar updatedBy y version
        allowedUpdates.updatedBy = updates.updatedBy || 'anonymous';
        allowedUpdates.version = existing.version + 1;

        const updated = await this.prisma.product.update({
            where: { id },
            data: allowedUpdates,
            include: {
                subcategory: {
                    include: {
                        category: true,
                    },
                },
            },
        });

        return this.mapToProduct(updated);
    }

    async delete(id: number): Promise<Product> {
        const existing = await this.prisma.product.findUnique({
            where: { id },
            include: {
                subcategory: {
                    include: {
                        category: true,
                    },
                },
            },
        });

        if (!existing) {
            throw new Error('Product not found');
        }

        // Soft delete: marcar como eliminado en lugar de borrar
        await this.prisma.product.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });

        return this.mapToProduct(existing);
    }

    // Método auxiliar para mapear de Prisma a dominio
    private mapToProduct(prismaProduct: any): Product {
        return new Product({
            id: prismaProduct.id,
            name: prismaProduct.name,
            description: prismaProduct.description,
            price: prismaProduct.price,
            stock: prismaProduct.stock,
            size: prismaProduct.size,
            color: prismaProduct.color,
            brand: prismaProduct.brand,
            subcategory: {
                id: prismaProduct.subcategory.id,
                name: prismaProduct.subcategory.name,
                description: prismaProduct.subcategory.description,
                category: {
                    id: prismaProduct.subcategory.category.id,
                    name: prismaProduct.subcategory.category.name,
                    description: prismaProduct.subcategory.category.description,
                },
            },
            createdAt: prismaProduct.createdAt?.toISOString(),
            updatedAt: prismaProduct.updatedAt?.toISOString(),
            createdBy: prismaProduct.createdBy,
            updatedBy: prismaProduct.updatedBy,
            version: prismaProduct.version,
        });
    }

    async disconnect(): Promise<void> {
        await this.prisma.$disconnect();
    }
}