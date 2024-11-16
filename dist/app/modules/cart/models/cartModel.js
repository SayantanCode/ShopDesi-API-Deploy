import mongoose from "mongoose";
const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    quantity: { type: Number, required: true, default: 1 },
}, { timestamps: true, versionKey: false });
export default mongoose.model("cart", cartSchema);
