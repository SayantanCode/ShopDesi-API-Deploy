import { Request, Response } from "express";
import * as userRepository from "../admin/repositories/admin.repository"
import { Status } from "../../helper/response"
class UserController {
    signup = async (req: Request, res: Response) => {
        try {
          const newUser = await userRepository.createUser(req.body);
            return res.status(newUser.status).json(newUser);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
      };
      verifyEmail = async (req: Request, res: Response) => {
        try {
          const user = await userRepository.verifyEmailOTP(req.body);
          return res.status(user.status).json(user);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
      }
      login = async (req: Request, res: Response) => {
        try {
          const user = await userRepository.loginUser(req.body, "user");
            return res.status(user.status).json(user);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
      };
      forgotPassword = async (req: Request, res: Response) => {
        try {
          const user = await userRepository.forgetPassword(req.body);
          
          return res.status(user.status).json(user);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
      };
      resetPassword = async (req: Request, res: Response) => {
        try {
          const user = await userRepository.resetPassword(req.body);
          return res.status(user.status).json(user);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
      }
      changePassword = async (req: Request, res: Response) => {
        try {
          const user = await userRepository.changePassword(req.body, req.user._id.toString());
          return res.status(user.status).json(user);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
      }
      getProfile = async (req: Request, res: Response) => {
        try {
          const user = await userRepository.getSingleUser(req.user._id.toString());
          return res.status(user.status).json(user);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
      }
      updateProfile = async (req: Request, res: Response) => {
        try {
          const user = await userRepository.updateProfile(req.body, req.user._id.toString(), req.file);
          return res.status(user.status).json(user);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
      }
      deleteUser = async (req: Request, res: Response) => {
        try {
          const user = await userRepository.deleteUser(req.params.id);
          return res.status(user.status).json(user);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
      }
}

export default new UserController();
