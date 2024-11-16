import mongoose from "mongoose";

const carousalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("carousal", carousalSchema)