import { Request, Response } from "express";
import * as carousalRepository from "../carousal/repositories/carousal.repository"
import { Status } from "../../helper/response"

class CarousalController {
    getCarousal = async (req: Request, res: Response) => {
        try {
            const carousal = await carousalRepository.getCarousal();
            return res.status(carousal.status).json(carousal);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
    }
}

export default new CarousalController()