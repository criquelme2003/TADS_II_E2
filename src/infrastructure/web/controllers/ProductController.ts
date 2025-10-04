import { Request, Response } from 'express';
import { CreateProduct } from '../../../application/use-cases/CreateProduct';
import { GetAllProducts } from '../../../application/use-cases/GetAllProducts';
import { GetProductById } from '../../../application/use-cases/GetProductById';
import { UpdateProduct } from '../../../application/use-cases/UpdateProduct';
import { PartialUpdateProduct } from '../../../application/use-cases/PartialUpdateProduct';
import { DeleteProduct } from '../../../application/use-cases/DeleteProduct';

interface UseCases {
    createProduct: CreateProduct;
    getAllProducts: GetAllProducts;
    getProductById: GetProductById;
    updateProduct: UpdateProduct;
    partialUpdateProduct: PartialUpdateProduct;
    deleteProduct: DeleteProduct;
}

export class ProductController {
    private createProduct: CreateProduct;
    private getAllProducts: GetAllProducts;
    private getProductById: GetProductById;
    private updateProduct: UpdateProduct;
    private partialUpdateProduct: PartialUpdateProduct;
    private deleteProduct: DeleteProduct;

    constructor(useCases: UseCases) {
        this.createProduct = useCases.createProduct;
        this.getAllProducts = useCases.getAllProducts;
        this.getProductById = useCases.getProductById;
        this.updateProduct = useCases.updateProduct;
        this.partialUpdateProduct = useCases.partialUpdateProduct;
        this.deleteProduct = useCases.deleteProduct;
    }

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const product = await this.createProduct.execute(req.body);
            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: product
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    getAll = async (req: Request, res: Response): Promise<void> => {
        try {
            const products = await this.getAllProducts.execute();
            res.status(200).json({
                success: true,
                count: products.length,
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    getById = async (req: Request, res: Response): Promise<void> => {
        try {
            const product = await this.getProductById.execute(parseInt(req.params.id));
            res.status(200).json({
                success: true,
                data: product
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const product = await this.updateProduct.execute(
                parseInt(req.params.id),
                req.body
            );
            res.status(200).json({
                success: true,
                message: 'Product updated successfully',
                data: product
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    partialUpdate = async (req: Request, res: Response): Promise<void> => {
        try {
            const product = await this.partialUpdateProduct.execute(
                parseInt(req.params.id),
                req.body
            );
            res.status(200).json({
                success: true,
                message: 'Product partially updated successfully',
                data: product
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    remove = async (req: Request, res: Response): Promise<void> => {
        try {
            const product = await this.deleteProduct.execute(parseInt(req.params.id));
            res.status(200).json({
                success: true,
                message: 'Product deleted successfully',
                data: product
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
