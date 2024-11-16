import express from "express";
import orderController from "../../modules/webservice/order.controller";
import * as auth from "../../middleware/auth";
const router = express.Router();
router.post("/payment/create-order", orderController.createOrder);
router.post ("/payment/verify-payment", orderController.verifyOrder);
router.get("/get/order", auth.verifyUserToken, orderController.getOrders);
export default router;