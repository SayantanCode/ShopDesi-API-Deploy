import express from "express";
import subCategoryController from "../../modules/subCategories/controllers/subCategory.controller";
import * as auth from "../../middleware/auth";

const router = express.Router();
router.all("*", auth.verifyAdminToken);
router.post("/create", subCategoryController.createSubCategory);
router.get("/all", subCategoryController.getSubCategories);
router.post("/update/:id", subCategoryController.updateSubCategory);
router.delete("/delete/:id", subCategoryController.deleteSubCategory);
export default router