import * as carousalRepository from "../carousal/repositories/carousal.repository.js";
import { Status } from "../../helper/response.js";
class CarousalController {
    getCarousal = async (req, res) => {
        try {
            const carousal = await carousalRepository.getCarousal();
            return res.status(carousal.status).json(carousal);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
}
export default new CarousalController();
