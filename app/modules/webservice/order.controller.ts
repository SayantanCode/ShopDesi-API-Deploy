import { Request, Response } from "express";
import * as orderRepository from "../orders/repositories/order.repository"
import { Status } from "../../helper/response"

class OrderController {
    // getCategories = async (req: Request, res: Response) => {
    //     try {
    //         const categories = await categoryRepository.groupedCatAndSubCat();
    //         return res.status(categories.status).json(categories);
    //     } catch (error) {
    //        return res.status(+Status.SERVER_ERROR).json({
    //           success: false,
    //           message: error,
    //        })
    //     }
    // }
    createOrder = async (req: Request, res: Response) => {
        try {
            const order = await orderRepository.createOrder(req.body);
            return res.status(order.status).json(order);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
    }
    verifyOrder = async (req: Request, res: Response) => {
        try {
            const order = await orderRepository.verifyPayment(req.body);
            return res.status(order.status).json(order);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
    }
    getOrders = async (req: Request, res: Response) => {
        try {
            const orders = await orderRepository.getOrdersbyUser(req.user._id);
            console.log(orders,"orders")
            return res.status(orders.status).json(orders);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
    }
}

export default new OrderController()