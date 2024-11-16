import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expires : { type: Date, required: true, default: () => Date.now() + 5*60*1000 }, // expires in 5 minutes from current time by default
}, { timestamps: true, versionKey: false });
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model("otp", otpSchema)