import * as reviewRepository from "../repositories/review.repository.js";
import { Status } from "../../../helper/response.js";
class ReviewController {
    getReviews = async (req, res) => {
        try {
            const reviews = await reviewRepository.getAllReviews();
            return res.status(reviews.status).json(reviews);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
    getAllReviews = async (req, res) => {
        try {
            const reviews = await reviewRepository.getAllReviews();
            return res.status(reviews.status).json(reviews);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
    deleteReview = async (req, res) => {
        try {
            const deletedReview = await reviewRepository.deleteReview(req.params.id);
            return res.status(deletedReview.status).json(deletedReview);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
}
export default new ReviewController();
