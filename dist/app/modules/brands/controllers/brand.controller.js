import * as brandRepository from "../repositories/brand.repository.js";
import { Status } from "../../../helper/response.js";
class BrandController {
    createBrand = async (req, res) => {
        try {
            const newBrand = await brandRepository.createBrand(req.body);
            return res.status(newBrand.status).json(newBrand);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
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
    updateBrand = async (req, res) => {
        try {
            const updatedBrand = await brandRepository.updateBrand(req.params.id, req.body);
            return res.status(updatedBrand.status).json(updatedBrand);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
    deleteBrand = async (req, res) => {
        try {
            const deletedBrand = await brandRepository.deleteBrand(req.params.id);
            return res.status(deletedBrand.status).json(deletedBrand);
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
