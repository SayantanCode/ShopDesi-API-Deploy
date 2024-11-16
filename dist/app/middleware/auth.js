import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { response } from "../helper/response.js";
import config from "../config/index.js";
import { Status } from "../helper/response.js";
export const hashPassword = async (password) => {
    try {
        const salt = await bcryptjs.genSalt(config.saltRounds);
        const hashedPassword = await bcryptjs.hash(password, salt);
        return hashedPassword;
    }
    catch (error) {
        console.log(error);
    }
};
export const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcryptjs.compare(password, hashedPassword);
    }
    catch (error) {
        console.log(error);
    }
};
export const generateJWTToken = (_id, name, email, role) => {
    try {
        return jwt.sign({ _id, name, email, role }, config.jwtSecret, {
            expiresIn: config.jwt_expiresin
        });
    }
    catch (error) {
        console.log(error);
    }
};
export const verifyAdminToken = async (req, res, next) => {
    try {
        const token = req.headers["x-auth-admin-token"];
        if (!token) {
            const error = response({
                status: Status.UNAUTHORIZED,
                customMessage: "Please login first"
            });
            return res.status(error.status).json({
                success: false,
                message: error.message
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        const err = response({
            status: Status.SERVER_ERROR,
            customMessage: error.message
        });
        return res.status(err.status).json({
            success: false,
            message: err.message
        });
    }
};
export const verifyUserToken = async (req, res, next) => {
    try {
        const token = req.headers["x-auth-user-token"];
        if (!token) {
            const error = response({
                status: Status.UNAUTHORIZED,
                customMessage: "Please login first"
            });
            return res.status(error.status).json({
                success: false,
                message: error.message
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        const err = response({
            status: Status.SERVER_ERROR,
            customMessage: error.message
        });
        return res.status(err.status).json({
            success: false,
            message: err.message
        });
    }
};
