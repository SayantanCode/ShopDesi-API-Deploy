import express from "express";
import userController from "../../modules/webservice/user.controller.js";
import * as auth from "../../middleware/auth.js";
import multer from "multer";
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg") {
        cb(null, true);
    }
    else {
        cb(new Error("File type not supported"), false);
    }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });
const uploadSingle = upload.single("avatar");
const handleUpload = (req, res, next) => {
    uploadSingle(req, res, (err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
        next();
    });
};
const router = express.Router();
router.post("/auth/signup", userController.signup);
router.post("/auth/verify", userController.verifyEmail);
router.post("/auth/login", userController.login);
router.post("/auth/forgot-password", userController.forgotPassword);
router.post("/auth/reset-password", userController.resetPassword);
router.post("/auth/change-password", auth.verifyUserToken, userController.changePassword);
router.get("/auth/profile", auth.verifyUserToken, userController.getProfile);
router.post("/auth/update-profile", auth.verifyUserToken, handleUpload, userController.updateProfile);
export default router;
