import cartModel from "../models/cartModel";
import userModel from "../../admin/models/userModel";
import productModel from "../../products/models/productModel";
import dealModel from "../../deals/models/dealModel";
import { response } from "../../../helper/response";
import { Status } from "../../../helper/response";
import mongoose from "mongoose";
export const addToCart = async (userId: string, productId: string) => {
    try {
        if(!userId || !productId) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "userId, productId is required"
            })
        }
        const existedUser = await userModel.findById(userId);
        if(!existedUser) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "User not found"
            })
        }
        const existedProduct = await productModel.findById(productId);
        if(!existedProduct) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "Product not found"
            })
        }
        // check product stock
        if (existedProduct.stock < 1) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "Product is currently out of stock"
            })
        }
        const existedCart = await cartModel.findOne({ userId, productId });
        if (existedCart) {
            existedCart.quantity = existedCart.quantity + 1
            await existedCart.save()
            return response({
                status: Status.CREATED,
                customMessage: "Product added to cart successfully",
                data: existedCart
            })
        }
        
        const newCart = new cartModel({
            userId,
            productId,
        })
        await newCart.save()
        return response({
            status: Status.CREATED,
            customMessage: "Product added to cart successfully",
            data: newCart
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })
    }
}
export const getCart = async (userId: string) => {
    try {
        if(!userId) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "userId is required"
            })
        }
        const existedUser = await userModel.findById(userId);
        if(!existedUser) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "User not found"
            })
        }
        const cart = await cartModel.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $project: {
                    _id: "$product._id",
                    name: "$product.name",
                    image: "$product.image",
                    mrp: "$product.mrp",
                    sellingPrice: "$product.sellingPrice",
                    quantity: 1,
                    stock: "$product.stock",
                    discount: "$product.discount"
                }
            }
        ]);

        // Sequential processing of cart items to handle async operations
        for (const item of cart) {
            if (item.stock === 0) {
                // Delete the item if stock is zero and remove from cart
                await cartModel.deleteOne({ userId, productId: item._id });
                const index = cart.findIndex(cartItem => cartItem._id === item._id);
                cart.splice(index, 1);
                // send email notification to the user that the product is out of stock and hence removed from the cart
            } else {
                // Lookup deal if applicable
                const deal = await dealModel.findOne({
                    product: item._id,
                    dealStart: { $lte: new Date() },
                    dealEnd: { $gte: new Date() }
                });

                // If deal exists, update discount and price
                if (deal) {
                    item.discount = deal.discountedPercentage;
                    item.sellingPrice = deal.discountedPrice; // This should be discounted price, not percentage if you intend to override the price
                    item.dealEnd = deal.dealEnd;
                }
            }
        }

        const totalPrice = cart.reduce((acc, item) => {
            return acc + item.sellingPrice * item.quantity;
        }, 0);

        return response({
            status: Status.SUCCESS,
            data: {
                cart,
                totalPrice
            }
        });
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        });
    }
};

export const removeFromCart = async (userId: string, productId: string) => {
    try {
        if(!userId || !productId) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "userId, productId is required"
            })
        }
        const existedUser = await userModel.findById(userId);
        if(!existedUser) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "User not found"
            })
        }
        const existedProduct = await productModel.findById(productId);
        if(!existedProduct) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "Product not found"
            })
        }
        const cart = await cartModel.findOneAndDelete({ userId, productId });
        return response({
            status: Status.DELETED,
            customMessage: "Product removed from cart successfully",
            data: cart
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })
    }
}
 export const substractFromCart = async (userId: string, productId: string) => {
    try {
        if(!userId || !productId) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "userId, productId is required"
            })
        }
        const existedUser = await userModel.findById(userId);
        if(!existedUser) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "User not found"
            })
        }
        const existedProduct = await productModel.findById(productId);
        if(!existedProduct) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "Product not found"
            })
        }
        const existedCart = await cartModel.findOne({ userId, productId });
        if(!existedCart) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "Product not found in cart"
            })
        }
        if(existedCart.quantity <= 1) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "Click on remove button to remove product from cart"
            })
        }
        const cart = await cartModel.findOneAndUpdate({ userId, productId }, { $inc: { quantity: -1 } }, { new: true });
        return response({
            status: Status.SUCCESS,
            customMessage: "Product substracted from cart successfully",
            data: cart
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })
    }
}