import * as productRepository from "../../modules/products/repositories/product.repository.js";
import { Status } from "../../helper/response.js";
class ProductController {
    getProducts = async (req, res) => {
        try {
            // if(req.path==="/api/user/products/deals"){
            //     console.log("getting deals")
            //     const products = await productRepository.getProducts(req.query, true);
            //     return res.status(products.status).json(products);
            // }
            const products = await productRepository.getProducts(req.query, false);
            return res.status(products.status).json(products);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
    getProductsWithDeals = async (req, res) => {
        try {
            const products = await productRepository.getProducts(req.query, true);
            return res.status(products.status).json(products);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
    getProductDetails = async (req, res) => {
        try {
            const product = await productRepository.getProduct(req.params.id);
            return res.status(product.status).json(product);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
    searchProductSuggestions = async (req, res) => {
        try {
            const products = await productRepository.searchSuggestions();
            return res.status(products.status).json(products);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
    relatedProducts = async (req, res) => {
        try {
            const products = await productRepository.randomRelatedProducts(req.params.id, req.query);
            return res.status(products.status).json(products);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
}
export default new ProductController();
