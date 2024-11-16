import express from "express";
import reviewController from "../../modules/webservice/review.controller.js";
import * as auth from "../../middleware/auth.js";
const router = express.Router();
router.get("/:id", auth.verifyUserToken, reviewController.getReviews); //send product id
router.post("/create", auth.verifyUserToken, reviewController.createReview);
export default router;
