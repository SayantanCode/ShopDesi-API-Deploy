import * as cartRepository from "../../modules/cart/repositories/cart.repository"
import { Request, Response } from "express";
import { Status } from "../../helper/response"

class CartController {
    createCart = async (req: Request, res: Response) => {
        try {
            const cart = await cartRepository.addToCart(req.user._id, req.params.productId);
            return res.status(cart.status).json(cart);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
    }
    getCarts = async (req: Request, res: Response) => {
        try {
            const carts = await cartRepository.getCart(req.user._id);
            return res.status(carts.status).json(carts);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
    }

    deleteCart = async (req: Request, res: Response) => {
        try {
            const cart = await cartRepository.removeFromCart(req.user._id, req.params.productId);
            return res.status(cart.status).json(cart);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
    }
    substractCart = async (req: Request, res: Response) => {
        try {
            const cart = await cartRepository.substractFromCart(req.user._id, req.params.productId);
            return res.status(cart.status).json(cart);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
    }
}

export default new CartController()