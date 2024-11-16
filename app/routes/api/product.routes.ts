import express from "express";
import productController from "../../modules/webservice/product.controller";

const router = express.Router();
router.get("/", productController.getProducts);
router.get('/deals', productController.getProductsWithDeals)
router.get("/search", productController.searchProductSuggestions);
router.get("/:id", productController.getProductDetails);
router.get("/related/:id", productController.relatedProducts);
export default router;
