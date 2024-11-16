import * as dealRepository from "../repositories/deal.repository.js";
import { Status } from "../../../helper/response.js";
class DealController {
    createDeal = async (req, res) => {
        try {
            const deal = await dealRepository.createDeal(req.body);
            return res.status(deal.status).json(deal);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
    getDeals = async (req, res) => {
        try {
            const deals = await dealRepository.getDeals();
            return res.status(deals.status).json(deals);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
    updateDeal = async (req, res) => {
        try {
            const deal = await dealRepository.updateDeal(req.params.id, req.body);
            return res.status(deal.status).json(deal);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
    deleteDeal = async (req, res) => {
        try {
            const deal = await dealRepository.deleteDeal(req.params.id);
            return res.status(deal.status).json(deal);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
}
export default new DealController();
