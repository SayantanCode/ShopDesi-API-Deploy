import express from "express";
import reviewController from "../../modules/reviews/controllers/review.controller.js";
import * as auth from "../../middleware/auth.js";
const router = express.Router();
router.all("*", auth.verifyAdminToken);
router.get("/all", reviewController.getReviews);
router.delete("/delete/:id", reviewController.deleteReview); //send review id
export default router;
