import mongoose from "mongoose";
import { ICategory } from "../../../interface/categoryInterface";
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: null },
    image: { type: String, required: true },
}, { timestamps: true, versionKey: false });
export default mongoose.model<ICategory>("category", categorySchema)