import mongoose from "mongoose";
import Iuser  from '../../../interface/userInterface'
const userSchema = new mongoose.Schema ({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    avatar: { type: String, default: "" },
    role: { type: String, default: "user", enum: ["user", "admin"] },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export default mongoose.model<Iuser>("user", userSchema)