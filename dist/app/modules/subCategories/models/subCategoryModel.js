import mongoose from "mongoose";
const subCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "category", required: true },
}, { timestamps: true, versionKey: false });
export default mongoose.model("subCategory", subCategorySchema);
