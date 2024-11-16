import * as subCategoryRepository from "../repositories/subCategory.repository"
import { Request, Response } from "express";
import { Status } from "../../../helper/response"

class SubCategoryController {
    createSubCategory = async (req: Request, res: Response) => {
        try {
            const subCategory = await subCategoryRepository.createSubCategory(req.body);
            return res.status(subCategory.status).json(subCategory);
        } catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            })
        }
    }

    getSubCategories = async (req: Request, res: Response) => {
        try {
            const subCategories = await subCategoryRepository.getSubCategories();
            return res.status(subCategories.status).json(subCategories);
        } catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            })
        }
    }

    updateSubCategory = async (req: Request, res: Response) => {
        try {
            const subCategory = await subCategoryRepository.updateSubCategory(req.body, req.params.id);
            return res.status(subCategory.status).json(subCategory);
        } catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            })
        }
    }

    deleteSubCategory = async (req: Request, res: Response) => {
        try {
            const subCategory = await subCategoryRepository.deleteSubCategory(req.params.id);
            return res.status(subCategory.status).json(subCategory);
        } catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            })
        }
    }
}

export default new SubCategoryController()