import express from "express";
import dealController from "../../modules/deals/controllers/deal.controller";
import * as auth from "../../middleware/auth";

const router = express.Router();
router.all("*", auth.verifyAdminToken);
router.post("/create", dealController.createDeal);
router.get("/all", dealController.getDeals);
router.post("/update/:id", dealController.updateDeal);
router.delete("/delete/:id", dealController.deleteDeal);
export default router;