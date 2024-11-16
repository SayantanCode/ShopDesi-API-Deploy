import mongoose from "mongoose";
import { ISubCategory } from "../../../interface/subCategoryInterface";
const subCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "category", required: true },
}, { timestamps: true, versionKey: false });
export default mongoose.model<ISubCategory>("subCategory", subCategorySchema)