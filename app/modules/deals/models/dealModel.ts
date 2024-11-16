import mongoose from "mongoose";
import { IDeal } from "../../../interface/dealInterface";
const dealsSchema = new mongoose.Schema({
    dealStart: { type: Date, required: true },
    dealEnd: { type: Date, required: true },
    discountedPrice: { type: Number, required: true },
    discountedPercentage: { type: Number, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
}, { timestamps: true, versionKey: false });
dealsSchema.index({ dealEnd: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model<IDeal>("deal", dealsSchema)