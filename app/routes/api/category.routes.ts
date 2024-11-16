import express from "express";
import categoryController from "../../modules/webservice/category.controller";
const router = express.Router();
router.get("/", categoryController.getCategories);
export default router;