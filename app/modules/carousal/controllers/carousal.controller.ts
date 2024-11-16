import { Request, Response } from "express";
import * as carousalRepository from "../repositories/carousal.repository";
import { Status } from "../../../helper/response"

class CarousalController {
    createcarousal = async (req: Request, res: Response) => {
        try {
            const carousal = await carousalRepository.addCarousal(req.body, req.file);
            return res.status(carousal.status).json(carousal);
        } catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            })
        }
    }

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

    updateCarousal = async (req: Request, res: Response) => {
        try {
            const carousal = await carousalRepository.updateCarousal(req.params.id, req.body, req.file);
            return res.status(carousal.status).json(carousal);
        } catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            })
        }
    }

    deleteCarousal = async (req: Request, res: Response) => {
        try {
            const carousal = await carousalRepository.deleteCarousal(req.params.id);
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