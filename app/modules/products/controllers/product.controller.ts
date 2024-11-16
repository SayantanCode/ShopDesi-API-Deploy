import { Request, Response } from "express";
import * as productRepository from "../repositories/product.repository";
import { Status } from "../../../helper/response"


class ProductController {

    createProduct = async (req: Request, res: Response) => {
        try {
            const newProduct = await productRepository.createProduct(req.body, req.files);
            return res.status(newProduct.status).json(newProduct);
        } catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            })
        }
    }

    getProducts = async (req: Request, res: Response) => {
        try {
            const products = await productRepository.getProducts(req.query, false, "admin");
            return res.status(products.status).json(products);
        } catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            })
        }
    }

    getProduct = async (req: Request, res: Response) => {
        try {
            const product = await productRepository.getProduct(req.params.id, "admin");
            return res.status(product.status).json(product);
        } catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            })
        }
    }

    updateProduct = async (req: Request, res: Response) => {
        try {
            const updatedProduct = await productRepository.updateProduct(req.params.id, req.body, req.files);
            return res.status(updatedProduct.status).json(updatedProduct);
        } catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            })
        }
    }
    updateProductStatus = async (req: Request, res: Response) => {
        try {
            const updatedProduct = await productRepository.updateProductStatus(req.params.id, req.body.status);
            return res.status(updatedProduct.status).json(updatedProduct);
        } catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            })
        }
    }
    deleteProduct = async (req: Request, res: Response) => {
        try {
            const deletedProduct = await productRepository.deleteProduct(req.params.id);
            return res.status(deletedProduct.status).json(deletedProduct);
        } catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            })
        }
    }
}

export default new ProductController()