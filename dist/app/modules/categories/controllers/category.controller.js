import * as categoryRepository from "../repositories/category.repository.js";
import { Status } from "../../../helper/response.js";
class CategoryController {
    createCategory = async (req, res) => {
        try {
            const category = await categoryRepository.createCategory(req.body, req.file);
            return res.status(category.status).json(category);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
    getCategories = async (req, res) => {
        try {
            const categories = await categoryRepository.getCategories();
            return res.status(categories.status).json(categories);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
    updateCategory = async (req, res) => {
        try {
            const category = await categoryRepository.updateCategory(req.params.id, req.body, req.file);
            return res.status(category.status).json(category);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
    deleteCategory = async (req, res) => {
        try {
            const category = await categoryRepository.deleteCategory(req.params.id);
            return res.status(category.status).json(category);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
}
export default new CategoryController();
