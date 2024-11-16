import userModel from "../models/userModel";
import otpModel from "../models/otpModel";
import IUser from "../../../interface/userInterface";
import { response } from "../../../helper/response";
import {
  userSignupSchema,
  userLoginSchema,
  userUpdateSchema,
} from "../../../validator/userValidation";
import {
  hashPassword,
  comparePassword,
  generateJWTToken,
} from "../../../middleware/auth";
import sendEmail from "../../../helper/mailer";
import otpGenerator from "../../../helper/otpGen";
import config from "../../../config";
import { Status } from "../../../helper/response";
import fs from "fs";

// Create User
export const createUser = async (body: IUser) => {
  try {
    const { name, email, password, confirmPassword } = body;
    const { error } = userSignupSchema.validate(
      { name, email, password, confirmPassword },
      { abortEarly: false }
    );
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return response({
        status: Status.BAD_REQUEST,
        customMessage: errorMessage,
      });
    }
    const existedUser = await userModel.findOne({ email });
    if (existedUser) {
      return response({
        status: Status.CONFLICT,
        customMessage: "User already exists",
      });
    }
    if (password !== confirmPassword) {
      return response({
        status: Status.BAD_REQUEST,
        customMessage: "Passwords do not match",
      });
    }
    const hashedPassword = await hashPassword(password);
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });
    // send mail with otp
    const otp = otpGenerator({ alphanumaric: false });
    const newOTP = new otpModel({
      email,
      otp,
    });
    await newOTP.save();
    sendEmail({
      email: email,
      subject: "Shop Desi.in| Verify Email OTP",
      text: `Your OTP to verify your email is ${otp} \n This OTP is valid for 10 minutes \n Please do not share this OTP with anyone \n If you did not request this OTP, please ignore this email... \n Thank you`,
    });
    const savedUser = await newUser.save();
    return response({
      status: Status.CREATED,
      data: savedUser,
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};
// Verify User Email OTP
export const verifyEmailOTP = async (body: any) => {
  try {
    const { email, otp } = body;
    if (!email || !otp) {
      return response({
        status: Status.BAD_REQUEST,
        customMessage: "Email and OTP are required",
      });
    }
    const existedUser = await userModel.findOne({ email });
    if (existedUser && existedUser.isVerified) {
      return response({
        status: Status.BAD_REQUEST,
        customMessage: "Email already verified",
      });
    }
    if (!existedUser) {
      return response({
        status: Status.NOT_FOUND,
        customMessage: "User does not exist",
      });
    }
    const existedOTP = await otpModel.findOne({ email, otp });
    if (!existedOTP) {
      await otpModel.deleteMany({ email });
      const newOTP = otpGenerator({ alphanumaric: false });
      const newOTPModel = new otpModel({
        email,
        otp: newOTP,
      });
      await newOTPModel.save();
      sendEmail({
        email: email,
        subject: "Shop Desi.in| Verify Email OTP",
        text: `Your OTP to verify your email is ${newOTP} \n This OTP is valid for 10 minutes \n Please do not share this OTP with anyone \n If you did not request this OTP, please ignore this email... \n Thank you`,
      });
      return response({
        status: Status.NOT_FOUND,
        customMessage: "Invalid OTP. New OTP is sent to your email",
      });
    }
    existedUser.isVerified = true;
    await existedUser.save();
    await otpModel.deleteOne({ email });
    return response({
      status: Status.SUCCESS,
      customMessage: "Email verified successfully",
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};
// Login user
export const loginUser = async (body: IUser, role: string) => {
  try {
    const { email, password } = body;
    const { error } = userLoginSchema.validate(
      { email, password },
      { abortEarly: false }
    );
    if (error) {
      return response({
        status: Status.BAD_REQUEST,
        customMessage: error.message,
      });
    }
    const existedUser = await userModel.findOne({ email });
    if (!existedUser) {
      return response({
        status: Status.NOT_FOUND,
        customMessage: "User does not exist",
      });
    }
    if (existedUser.role !== role) {
      return response({
        status: Status.UNAUTHORIZED,
        customMessage: `Only ${role} can login from this route`,
      });
    }
    if (existedUser.isActive === false) {
      return response({
        status: Status.UNAUTHORIZED,
        customMessage:
          "Your account has been deactivated. Can't login any more",
      });
    }
    if (existedUser.isDeleted === true) {
      return response({
        status: Status.UNAUTHORIZED,
        customMessage: "Your account has been deleted. Can't login any more",
      });
    }
    const isMatch = await comparePassword(password, existedUser.password);
    if (!isMatch) {
      return response({
        status: Status.UNAUTHORIZED,
        customMessage: "Incorrect password",
      });
    }
    if (!existedUser.isVerified) {
      return response({
        status: Status.UNAUTHORIZED,
        customMessage: "Please verify your email before login",
      });
    }
    const token = generateJWTToken(
      existedUser._id.toString(),
      existedUser.name,
      existedUser.email,
      existedUser.role
    );
    return response({
      status: Status.SUCCESS,
      customMessage: "Login successful",
      data: {
        token,
        user: {
          _id: existedUser._id,
          name: existedUser.name,
          email: existedUser.email,
          role: existedUser.role,
          avatar: existedUser.avatar,
          loginTime: Date.now(),
        },
      },
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};
// Forget Password
export const forgetPassword = async (body: any) => {
  try {
    const { email } = body;
    if (!email) {
      return response({
        status: Status.BAD_REQUEST,
        customMessage: "Email is required",
      });
    }
    const existedUser = await userModel.findOne({ email });
    if (!existedUser) {
      return response({
        status: Status.NOT_FOUND,
        customMessage: "User does not exist",
      });
    }
    const otp = otpGenerator({ alphanumaric: false });
    const newOTP = new otpModel({
      email,
      otp,
    });
    await newOTP.save();
    sendEmail({
      email: email,
      subject: "Shop Desi.in| Reset Password OTP",
      text: `Your OTP to reset your password is ${otp} \n This OTP is valid for 5 minutes \n Please do not share this OTP with anyone \n If you did not request this OTP, please ignore this email... \n Thank you`,
    });
    return response({
      status: Status.SUCCESS,
      customMessage: "New OTP sent to your email",
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};
// Reset Password
export const resetPassword = async (body: any) => {
  try {
    const { email, otp, password } = body;
    if (!email || !otp || !password) {
      return response({
        status: Status.BAD_REQUEST,
        customMessage: "Email, OTP and password are required",
      });
    }
    const existedUser = await userModel.findOne({ email });
    if (!existedUser) {
      return response({
        status: Status.NOT_FOUND,
        customMessage: "User does not exist",
      });
    }
    const existedOTP = await otpModel.findOne({ email, otp });
    if (!existedOTP) {
      await otpModel.deleteMany({ email });
      const newOTP = otpGenerator({ alphanumaric: false });
      const newOTPModel = new otpModel({
        email,
        otp: newOTP,
      });
      await newOTPModel.save();
      sendEmail({
        email: email,
        subject: "Shop Desi.in| Reset Password OTP",
        text: `Your OTP to reset your password is ${otp} \n This OTP is valid for 5 minutes \n Please do not share this OTP with anyone \n If you did not request this OTP, please ignore this email... \n Thank you`,
      });
      return response({
        status: Status.NOT_FOUND,
        customMessage: "Invalid OTP. New OTP has been sent",
      });
    }
    const hashedPassword = await hashPassword(password);
    existedUser.password = hashedPassword as string;
    await existedUser.save();
    await otpModel.deleteOne({ email });
    return response({
      status: Status.SUCCESS,
      customMessage: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};
// Change Password
export const changePassword = async (body: any, _id: string) => {
  try {
    const { oldPassword, newPassword } = body;
    if (!oldPassword || !newPassword) {
      return response({
        status: Status.BAD_REQUEST,
        customMessage: "old password and new password are required",
      });
    }
    const existedUser = await userModel.findById(_id);
    if (!existedUser) {
      return response({
        status: Status.NOT_FOUND,
        customMessage: "User does not exist",
      });
    }
    const isMatch = await comparePassword(oldPassword, existedUser.password);
    if (!isMatch) {
      return response({
        status: Status.UNAUTHORIZED,
        customMessage: "Incorrect old password",
      });
    }
    const hashedPassword = await hashPassword(newPassword);
    existedUser.password = hashedPassword as string;
    await existedUser.save();
    return response({
      status: Status.SUCCESS,
      customMessage: "Password changed successfully",
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};
// Update Profile
export const updateProfile = async (body: any, _id: string, file: any) => {
  try {
    const { name, email, phone, address } = body;
    if(!_id) {
      return response({
        status: Status.BAD_REQUEST,
        customMessage: "User id is required"
      })
    }
    if(!name && !email && !phone && !address && !file) {
      return response({
        status: Status.BAD_REQUEST,
        customMessage: "At least one field is required to update"
      })
    }
    const existedUser = await userModel.findById(_id);
    if (!existedUser) {
      return response({
        status: Status.NOT_FOUND,
        customMessage: "User does not exist",
      });
    }
    if(email){
      const existedEmail = await userModel.findOne({email});
      if(existedEmail && existedEmail._id.toString() !== _id.toString()){
        return response({
          status: Status.BAD_REQUEST,
          customMessage: "Email already exists, please try with another email",
        });
      }
    }
    if(phone){
      const existedPhone = await userModel.findOne({phone});
      if(existedPhone && existedPhone._id.toString() !== _id.toString()){
        return response({
          status: Status.BAD_REQUEST,
          customMessage: "Phone number already exists, please try with another phone number",
        });
      }
    }
    const updatedUser = await userModel.findByIdAndUpdate(
      { _id },
      {
        name,
        email,
        phone,
        address,
      },
      { new: true }
    );
    if (file) {
      const { filename } = file;
      const avatar = `${config.baseUrl}/uploads/${filename}`;
      if (updatedUser && updatedUser.avatar) {
        fs.unlinkSync(`public/uploads/${existedUser.avatar.split("/").pop()}`);
        updatedUser.avatar = avatar
        await updatedUser.save();
      }
      if (updatedUser && !updatedUser.avatar) {
        updatedUser.avatar = avatar
        await updatedUser.save();
      }
    }
    return response({
      status: Status.SUCCESS,
      customMessage: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};
// Update User Status
export const updateUserStatus = async (_id: string) => {
  try {
    const user = await userModel.findById(_id);
    if (!user) {
      return response({
        status: Status.NOT_FOUND,
        customMessage: "User does not exist",
      });
    }
    user.isActive = !user.isActive;
    await user.save();
    return response({
      status: Status.SUCCESS,
      customMessage: "User status updated successfully",
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};
// Get all users
export const getAllUsers = async () => {
  try {
    const users = await userModel
      .find(
        {
          role: "user",
        },
        { password: 0 }
      )
      .sort({ createdAt: -1 })
    return response({
      status: Status.SUCCESS,
      forTerm: "All Users",
      data: users,
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};
// Get single user
export const getSingleUser = async (_id: string) => {
  try {
    const user = await userModel.findById(_id, { password: 0 });
    if (!user) {
      return response({
        status: Status.NOT_FOUND,
        customMessage: "User does not exist",
      });
    }
    return response({
      status: Status.SUCCESS,
      forTerm: "User",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};
// Delete user
export const deleteUser = async (_id: string, type?: string) => {
  try {
    if (type === "HARD") {
      const user = await userModel.findByIdAndDelete(_id);
      if (user) {
        if(user.avatar){
          fs.unlinkSync(`public/uploads/${user.avatar.split("/").pop()}`);
        }
        return response({
          status: Status.DELETED,
          forTerm: "User",
        });
      }else{
        return response({
          status: Status.NOT_FOUND,
          customMessage: "User does not exist",
        });
      }
    } else {
      const user = await userModel.findByIdAndUpdate(_id, { isDeleted: true });
      return response({
        status: Status.DELETED,
        forTerm: "User",
      });
    }
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};
export const searchUser = async (query: any) => {
  try {
    const { term } = query;
    const users = await userModel
      .find({
        $or: [
          { name: new RegExp(term, "i") },
          { email: new RegExp(term, "i") },
        ],
        $nor: [
            { role: "admin" }
          ]        
      },{password:0}).limit(10)
    return response({
      status: Status.SUCCESS,
      customMessage:"Search results for "+term,
      data: users,
    })
  } catch (error) {
    return response({
      status: Status.SERVER_ERROR,
    })
  }
};
