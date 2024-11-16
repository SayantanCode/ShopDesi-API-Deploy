import { Request, Response } from "express";
import * as productRepository from "../../modules/products/repositories/product.repository";
import { Status } from "../../helper/response"


class ProductController {

    getProducts = async (req: Request, res: Response) => {
        try {
            // if(req.path==="/api/user/products/deals"){
            //     console.log("getting deals")
            //     const products = await productRepository.getProducts(req.query, true);
            //     return res.status(products.status).json(products);
            // }
            const products = await productRepository.getProducts(req.query, false);
            return res.status(products.status).json(products);
        } catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            })
        }
    }
    getProductsWithDeals = async (req: Request, res: Response) => {
        try {
            const products = await productRepository.getProducts(req.query, true);
            return res.status(products.status).json(products);
        } catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            })
        }
    }
    getProductDetails = async (req: Request, res: Response) => {
        try {
            const product = await productRepository.getProduct(req.params.id);
            return res.status(product.status).json(product);
        } catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            })
        }
    }
    searchProductSuggestions = async (req: Request, res: Response) => {
        try {
            const products = await productRepository.searchSuggestions();
            return res.status(products.status).json(products);
        } catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            })
        }
    }
    relatedProducts = async (req: Request, res: Response) => {
        try {
            const products = await productRepository.randomRelatedProducts(req.params.id, req.query);
            return res.status(products.status).json(products);
        } catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            })
        }
    }
}

export default new ProductController()