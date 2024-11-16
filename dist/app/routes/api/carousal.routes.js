import express from "express";
import carousalController from "../../modules/webservice/carousal.controller.js";
const router = express.Router();
router.get("/", carousalController.getCarousal);
export default router;
