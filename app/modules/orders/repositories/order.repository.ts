import orderModel from "../models/orderModel";
import productModel from "../../products/models/productModel";
// import { IDeal } from "../../../interface/dealInterface";
import { response } from "../../../helper/response";
import { Status } from "../../../helper/response";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import crypto from "crypto";
import cartModel from "../../cart/models/cartModel";
// Initialize Razorpay instance with your key and secret
const razorpayInstance = new Razorpay({
  key_id: "rzp_test_xDtorWB2iU4yEf",
  key_secret: "S7nrqWuxbpeRvLVdsNyqxBbS",
});

export const createOrder = async (body: any) => {
  try {
    const { user, orderItems, totalAmount, address, phone } = body;

    // Check Existed Product Stock Then Proceed
    for (const item of orderItems) {
      const product = await productModel.findById(item.product);
      if (!product) {
        return response({
          status: Status.NOT_FOUND,
          customMessage: "Product not found",
        });
      }
      if (product.stock < item.quantity) {
        return response({
          status: Status.BAD_REQUEST,
          customMessage: `Please remove ${
            item.quantity - product.stock
          } item(s) with name ${
            product.name
          } from your cart to proceed as it is low in stock`,
        });
      }
    }
    // Create a Razorpay Order Options
    const options = {
      amount: totalAmount * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_order_${Math.random() * 1000}`,
    };
    // Create a Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create(options);

    // Create an order in your DB without payment details yet
    const newOrder = new orderModel({
      user,
      orderItems,
      totalAmount,
      shippingAddress: address,
      phone: phone,
      razorpayOrderId: razorpayOrder.id, // Store Razorpay orderId in your DB
    });

    await newOrder.save();
    for(const item of orderItems) {
      const product = await productModel.findById(item.product);
      if(!product) {
        return response({
          status: Status.NOT_FOUND,
          customMessage: "Product not found",
        });
      }
      product.stock = product.stock - item.quantity;
      await product.save();
    }
    return response({
      status: Status.CREATED,
      customMessage: "Razorpay order created",
      data: {
        orderId: razorpayOrder.id,
        amount: options.amount,
      },
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
      customMessage: "Error creating Razorpay order",
    });
  }
};

export const verifyPayment = async (body: any) => {
  try {
    const { orderId, paymentId, signature } = body;
    // Generate signature using Razorpay key_secret and order ID + payment ID
    const generatedSignature = crypto
      .createHmac("sha256", "S7nrqWuxbpeRvLVdsNyqxBbS") // Replace with your key_secret
      .update(orderId + "|" + paymentId)
      .digest("hex");

    // Verify the signature
    if (generatedSignature === signature) {
      // Update the existing order with payment details
      const updatedOrder = await orderModel.findOneAndUpdate(
        { razorpayOrderId: orderId }, // Find order by Razorpay order ID
        {
          paymentId: paymentId, // Save payment ID
          paymentStatus: "Paid", // Update payment status
        },
        { new: true }
      );

      const deleteCartofUser = await cartModel.deleteMany(
        { userId: updatedOrder?.user } // Find order by user ID
      );
      console.log(deleteCartofUser, "deleteCartofUser");

      return response({
        status: Status.SUCCESS,
        customMessage: "Payment verified successfully. Order status updated",
      });
    } else {
      return response({
        status: Status.BAD_REQUEST,
        customMessage: "Invalid signature. Payment verification failed",
      });
    }
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
      customMessage: "Error verifying payment",
    });
  }
};

export const getOrdersbyUser = async (userId: string) => {
  try {
    const orders = await orderModel.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      // Lookup to get user information (name)
      {
        $lookup: {
          from: 'users', // Collection name for users
          localField: 'user', // Field in the order collection
          foreignField: '_id', // Field in the user collection
          as: 'userDetails' // Alias for the joined data
        }
      },
      {
        $unwind: '$userDetails' // Unwind since we expect only one user
      },
      // Unwind the order items array to process each item
      {
        $unwind: '$orderItems' 
      },
      // Lookup to get product details (name, image) for each order item
      {
        $lookup: {
          from: 'products', // Collection name for products
          localField: 'orderItems.product', // Field in orderItems to match products
          foreignField: '_id', // Field in products collection
          as: 'productDetails' // Alias for the joined data
        }
      },
      // Match the correct product for each order item
      {
        $addFields: {
          productDetails: {
            $arrayElemAt: ['$productDetails', 0] // Get the first matching product
          }
        }
      },
      // Group back the order items with the correct product details
      {
        $group: {
          _id: '$_id', // Group by the order ID
          totalAmount: { $first: '$totalAmount' },
          shippingAddress: { $first: '$shippingAddress' },
          phone: { $first: '$phone' },
          paymentStatus: { $first: '$paymentStatus' },
          user: { $first: '$userDetails.name' }, // Get the user's name
          createdAt: { $first: '$createdAt' },
          orderItems: {
            $push: {
              productId: '$orderItems.product',
              name: '$productDetails.name', // Get product name
              image: '$productDetails.image', // Get product image
              quantity: '$orderItems.quantity',
              price: '$orderItems.price',
              status: '$orderItems.status'
            }
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);
    if(!orders) {
      return response({
        status: Status.NOT_FOUND,
        customMessage: "Orders not found",
      });
    }
    return response({
      status: Status.SUCCESS,
      customMessage: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
      // customMessage: "Error fetching orders",
    });
  }
};

export const getOrders = async () => {
  try {
    const orders = await orderModel.aggregate([
      // Lookup to get user information (name)
      {
        $lookup: {
          from: 'users', // Collection name for users
          localField: 'user', // Field in the order collection
          foreignField: '_id', // Field in the user collection
          as: 'userDetails' // Alias for the joined data
        }
      },
      {
        $unwind: '$userDetails' // Unwind since we expect only one user
      },
      // Unwind the order items array to process each item
      {
        $unwind: '$orderItems' 
      },
      // Lookup to get product details (name, image) for each order item
      {
        $lookup: {
          from: 'products', // Collection name for products
          localField: 'orderItems.product', // Field in orderItems to match products
          foreignField: '_id', // Field in products collection
          as: 'productDetails' // Alias for the joined data
        }
      },
      // Match the correct product for each order item
      {
        $addFields: {
          productDetails: {
            $arrayElemAt: ['$productDetails', 0] // Get the first matching product
          }
        }
      },
      // Group back the order items with the correct product details
      {
        $group: {
          _id: '$_id', // Group by the order ID
          totalAmount: { $first: '$totalAmount' },
          shippingAddress: { $first: '$shippingAddress' },
          phone: { $first: '$phone' },
          paymentStatus: { $first: '$paymentStatus' },
          user: { $first: '$userDetails.name' }, // Get the user's name
          createdAt: { $first: '$createdAt' },
          orderItems: {
            $push: {
              productId: '$orderItems.product',
              name: '$productDetails.name', // Get product name
              image: '$productDetails.image', // Get product image
              quantity: '$orderItems.quantity',
              price: '$orderItems.price',
              status: '$orderItems.status'
            }
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);
    
    return response({
      status: Status.SUCCESS,
      customMessage: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};

export const updateOrderStatus = async (orderId: string, body: any) => {
  try {
    const {productId, status } = body;
    console.log(productId, status)
    const updatedOrder = await orderModel.findOneAndUpdate(
      { _id: orderId, orderItems: { $elemMatch: { product: productId } } },
      { $set: { "orderItems.$.status": status } },
      { new: true }
    );
    // const updatedOrder = await orderModel.aggregate([
    //   {
    //     $match: {
    //       _id: new mongoose.Types.ObjectId(orderId),
    //       "orderItems.product": new mongoose.Types.ObjectId(productId)
    //     }
    //   },
    //   {
    //     $set: {
    //       "orderItems.$.status": status
    //     }
    //   }
    // ])
    return response({
      status: Status.SUCCESS,
      customMessage: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};
