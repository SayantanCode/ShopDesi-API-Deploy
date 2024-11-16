import { Request, Response } from "express";
import * as reviewRepository from "../repositories/review.repository";
import { Status } from "../../../helper/response"


class ReviewController {

    getReviews = async (req: Request, res: Response) => {
        try {
            const reviews = await reviewRepository.getAllReviews()
            return res.status(reviews.status).json(reviews);
        } catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            })
        }
    }
    getAllReviews = async (req: Request, res: Response) => {
        try {
            const reviews = await reviewRepository.getAllReviews();
            return res.status(reviews.status).json(reviews);
        } catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            })
        }
    }
    deleteReview = async (req: Request, res: Response) => {
        try {
            const deletedReview = await reviewRepository.deleteReview(req.params.id);
            return res.status(deletedReview.status).json(deletedReview);
        } catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            })
        }
    }
}

export default new ReviewController()