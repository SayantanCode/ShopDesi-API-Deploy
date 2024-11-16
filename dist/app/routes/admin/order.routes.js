import express from "express";
import orderController from "../../modules/orders/controllers/order.controller.js";
import * as auth from "../../middleware/auth.js";
const router = express.Router();
router.all("*", auth.verifyAdminToken);
router.get("/all", orderController.getOrders);
router.post("/update-status/:id", orderController.updateOrder);
export default router;
