import * as reviewRepository from "../../modules/reviews/repositories/review.repository";
import { Request, Response } from "express";
import { Status } from "../../helper/response"


class ReviewController {
    createReview = async (req: Request, res: Response) => {
        try {
          const newReview = await reviewRepository.createReview(req.user._id, req.body);
            return res.status(newReview.status).json(newReview);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
      };
      getReviews = async (req: Request, res: Response) => { 
        try {
          const reviews = await reviewRepository.getReviews(req.params.id);
            return res.status(reviews.status).json(reviews);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
      };
}

export default new ReviewController()