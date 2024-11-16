import mongoose from "mongoose";
import { IReview } from "../../../interface/reviewInterface";
const reviewSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "products", required: true },
        rating: { type: Number, required: true },
        title: { type: String, required: true },
        comment: { type: String },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model<IReview>("reviews", reviewSchema)