import mongoose from "mongoose";
const brandSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: null },
    logo: { type: String, default: null },
}, { timestamps: true, versionKey: false });
export default mongoose.model("brand", brandSchema);
