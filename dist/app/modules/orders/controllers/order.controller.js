import * as orderRepository from "../repositories/order.repository.js";
import { Status } from "../../../helper/response.js";
class OrderController {
    getOrders = async (req, res) => {
        try {
            const orders = await orderRepository.getOrders();
            return res.status(orders.status).json(orders);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
    updateOrder = async (req, res) => {
        try {
            const order = await orderRepository.updateOrderStatus(req.params.id, req.body);
            return res.status(order.status).json(order);
        }
        catch (error) {
            return res.status(+Status.SERVER_ERROR).json({
                success: false,
                message: error,
            });
        }
    };
}
export default new OrderController();
