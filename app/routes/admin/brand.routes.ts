import express from "express";
import brandController from "../../modules/brands/controllers/brand.controller";
import * as auth from "../../middleware/auth";

const router = express.Router();
router.all("*", auth.verifyAdminToken);
router.post("/create", brandController.createBrand);
router.get("/all", brandController.getBrands);
router.post("/update/:id", brandController.updateBrand);
router.delete("/delete/:id", brandController.deleteBrand);
export default router;