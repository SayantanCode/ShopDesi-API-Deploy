import mongoose from "mongoose";
import { IProduct } from "../../../interface/productInterface";
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    mrp: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    discount: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "category", required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "subCategory", required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "brand", required: true },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalRating: { type: Number, default: 0 },
    image: { type: [String]},
    status: {type: String, default: "Active", enum: ["Active", "Inactive", "Scheduled"]},
    launchDate: { type: Date, default: null },
}, { timestamps: true, versionKey: false });
export default mongoose.model<IProduct>("product", productSchema)