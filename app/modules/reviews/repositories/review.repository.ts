import reviewModel from "../models/reviewModel";
import { IReview } from "../../../interface/reviewInterface";
import { response } from "../../../helper/response";
import { Status } from "../../../helper/response";
import orderModel from "../../orders/models/orderModel";
import productModel from "../../products/models/productModel";
import mongoose from "mongoose";
export const createReview = async (userId: string, body: IReview) => {
  try {
    const { productId, rating, title, comment } = body;
    if (!userId || !productId || !rating || !title || !comment) {
      return response({
        status: Status.BAD_REQUEST,
        customMessage:
          "userId, productId, rating, title and comment is required",
      });
    }
    const order = await orderModel.findOne({
      user: userId,
      "orderItems.product": productId,
      "orderItems.status": "Delivered",
    });
    if (!order) {
      return response({
        status: Status.NOT_FOUND,
        customMessage: "You can only review a product that has been delivered.",
      });
    }
    // const order = orderModel.findOne({orderItems: { $elemMatch: { product: productId } }, user: userId });
    const existedReview = await reviewModel.findOne({ userId, productId });
    if (existedReview) {
      return response({
        status: Status.CONFLICT,
        customMessage: "You have already reviewed this product",
      });
    }
    const newReview = new reviewModel({
      userId,
      productId,
      rating,
      title,
      comment,
    });
    await newReview.save();
    const product = await productModel.findById(productId);
    if(!product) {
      return response({
        status: Status.NOT_FOUND,
        customMessage: "Product not found",
      });
    }
    await productModel.findByIdAndUpdate(
      productId,
      {
        rating:(product.rating? (product.rating+rating)/2 : 0 + rating),
        totalRating: product.totalRating + 1
      },
      { new: true }
    );
    return response({
      status: Status.CREATED,
      customMessage: "Review created successfully",
      data: newReview,
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};

export const getReviews = async (productId: string) => {
  try {
    if (!productId) {
      return response({
        status: Status.BAD_REQUEST,
        customMessage: "productId is required",
      });
    }
    const reviews = await reviewModel.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(productId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        }
      },
      {
        $unwind: "$product",
      },
      {
        $project: {
          _id: 1,
          rating: 1,
          title: 1,
          comment: 1,
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
            image: "$user.avatar",
          },
          product: {
            _id: "$product._id",
            name: "$product.name",
            image: "$product.image",
          },
          createdAt: 1,
        },
      }
    ])
    return response({
      status: Status.SUCCESS,
      data: reviews,
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};
export const getAllReviews = async () => {
  try {
    const reviews = await reviewModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        }
      },
      {
        $unwind: "$product",
      },
      {
        $project: {
          _id: 1,
          rating: 1,
          title: 1,
          comment: 1,
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
            image: "$user.avatar",
          },
          product: {
            _id: "$product._id",
            name: "$product.name",
            image: "$product.image",
          },
          createdAt: 1,
        },
      }
    ])
    return response({
      status: Status.SUCCESS,
      data: reviews,
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};
export const deleteReview = async (revierId: string) => {
  try {
    if (!revierId) {
      return response({
        status: Status.BAD_REQUEST,
        customMessage: "revierId is required",
      });
    }
    const deletedReview = await reviewModel.findByIdAndDelete({
      _id: revierId,
    });
    if (!deletedReview) {
      return response({
        status: Status.NOT_FOUND,
        customMessage: "Review not found",
      });
    }
    const product = await productModel.findById(deletedReview.productId);
    if(!product) {
      return response({
        status: Status.NOT_FOUND,
        customMessage: "Product not found",
      });
    }
    await productModel.findByIdAndUpdate(
      deletedReview.productId,
      {
        rating:(product.rating? (product.rating-deletedReview.rating)/2 : 0 - deletedReview.rating),
        totalRating: product.totalRating - 1
      },
      { new: true }
    );
    return response({
      status: Status.SUCCESS,
      customMessage: "Review deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};
