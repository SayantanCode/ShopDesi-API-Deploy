import express from "express";
import orderController from "../../modules/orders/controllers/order.controller";
import * as auth from "../../middleware/auth";

const router = express.Router();
router.all("*", auth.verifyAdminToken);
router.get("/all", orderController.getOrders);
router.post("/update-status/:id", orderController.updateOrder);
export default router;