import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        status: { type: String, default: "Pending" },
      },
    ],
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: String, required: true },
    phone: { type: String, required: true },
    razorpayOrderId: { type: String }, // Save Razorpay order ID
    paymentId: { type: String }, // Save Razorpay payment ID after verification
    paymentStatus: { type: String, default: "Pending" }, // Payment status: Pending, Paid, Failed
  }, { timestamps: true, versionKey: false });

export default mongoose.model("order", orderSchema)