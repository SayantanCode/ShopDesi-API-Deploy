import { Request, Response } from "express";
import * as brandRepository from "../brands/repositories/brand.repository"
import { Status } from "../../helper/response"

class BrandController {
    getBrands = async (req: Request, res: Response) => {
        try {
            const brands = await brandRepository.getBrands();
            return res.status(brands.status).json(brands);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
    }
}

export default new BrandController()