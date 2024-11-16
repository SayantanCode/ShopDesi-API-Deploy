import bcryptjs from "bcryptjs";
import {Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {response} from "../helper/response";
import config from "../config";
import { Status } from "../helper/response";
export const hashPassword = async(password: string) => {
    try {
        const salt = await bcryptjs.genSalt(config.saltRounds as number);
        const hashedPassword = await bcryptjs.hash(password, salt);
        return hashedPassword
    } catch (error) {
        console.log(error)
    }
}

export const comparePassword = async(password: string, hashedPassword: string) => {
    try {
        return await bcryptjs.compare(password, hashedPassword);
    } catch (error) {
        console.log(error)
    }
}

export const generateJWTToken = (_id: string, name: string, email: string, role: string) => {
    try {
        return jwt.sign({ _id, name, email, role }, config.jwtSecret, {
            expiresIn: config.jwt_expiresin
        })
    } catch (error) {
        console.log(error)
    }
}

export const verifyAdminToken = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers["x-auth-admin-token"];
        if (!token) {
            const error = response({
                status: Status.UNAUTHORIZED,
                customMessage: "Please login first"
            })
            return res.status(error.status).json(
                {
                    success: false,
                    message: error.message
                }
            )
        }
        const decoded = jwt.verify(token as string, process.env.JWT_SECRET);
        req.user = decoded as any;
        next();
    } catch (error: any) {
        const err = response({
            status: Status.SERVER_ERROR,
            customMessage: error.message
        })
        return res.status(err.status).json(
            {
                success: false,
                message: err.message
            }
        )
    }
}

export const verifyUserToken = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers["x-auth-user-token"];
        if (!token) {
            const error = response({
                status: Status.UNAUTHORIZED,
                customMessage: "Please login first"
            })
            return res.status(error.status).json(
                {
                    success: false,
                    message: error.message
                }
            )
        }
        const decoded = jwt.verify(token as string, process.env.JWT_SECRET);
        req.user = decoded as any;
        next();
    } catch (error: any) {
        const err = response({
            status: Status.SERVER_ERROR,
            customMessage: error.message
        })
        return res.status(err.status).json(
            {
                success: false,
                message: err.message
            }
        )
    }
}
