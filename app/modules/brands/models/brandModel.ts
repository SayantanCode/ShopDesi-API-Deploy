import mongoose from "mongoose";
import { IBrand } from "../../../interface/brandInterface";
const brandSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: null },
    logo: { type: String, default: null },
}, { timestamps: true, versionKey: false });
export default mongoose.model<IBrand>("brand", brandSchema)