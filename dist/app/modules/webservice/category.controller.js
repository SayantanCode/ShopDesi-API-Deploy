import * as categoryRepository from "../categories/repositories/category.repository.js";
import { Status } from "../../helper/response.js";
class CategoryController {
    getCategories = async (req, res) => {
        try {
            const categories = await categoryRepository.groupedCatAndSubCat();
            return res.status(categories.status).json(categories);
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
