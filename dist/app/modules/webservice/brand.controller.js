import * as brandRepository from "../brands/repositories/brand.repository.js";
import { Status } from "../../helper/response.js";
class BrandController {
    getBrands = async (req, res) => {
        try {
            const brands = await brandRepository.getBrands();
            return res.status(brands.status).json(brands);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
}
export default new BrandController();
