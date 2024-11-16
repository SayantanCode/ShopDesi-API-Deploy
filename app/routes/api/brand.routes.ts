import express from "express";
import brandController from "../../modules/webservice/brand.controller";
const router = express.Router();
router.get("/", brandController.getBrands);
export default router;