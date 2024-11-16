import { Request, Response } from "express";
import * as userRepository from "../repositories/admin.repository";
import { Status } from "../../../helper/response"
class AdminController {
      login = async (req: Request, res: Response) => {
        try {
          const user = await userRepository.loginUser(req.body, "admin");
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
      updateUserStatus = async (req: Request, res: Response) => {
        try {
          const user = await userRepository.updateUserStatus(req.params.id);
          return res.status(user.status).json(user);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
      }
      getAllUsers = async (req: Request, res: Response) => {
        try {
          const users = await userRepository.getAllUsers();
          return res.status(users.status).json(users);
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
      searchUser = async (req: Request, res: Response) => {
        try {
          const users = await userRepository.searchUser(req.query);
          return res.status(users.status).json(users);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
      }
      deleteUser = async (req: Request, res: Response) => {
        try {
          const user = await userRepository.deleteUser(req.params.id, "HARD");
          return res.status(user.status).json(user);
        } catch (error) {
           return res.status(+Status.SERVER_ERROR).json({
              success: false,
              message: error,
           })
        }
      }
}

export default new AdminController();
