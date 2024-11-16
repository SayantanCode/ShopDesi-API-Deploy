import { Request, Response } from "express";
import * as categoryRepository from "../categories/repositories/category.repository"
import { Status } from "../../helper/response"

class CategoryController {
    getCategories = async (req: Request, res: Response) => {
        try {
            const categories = await categoryRepository.groupedCatAndSubCat();
            return res.status(categories.status).json(categories);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
    }
}

export default new CategoryController()