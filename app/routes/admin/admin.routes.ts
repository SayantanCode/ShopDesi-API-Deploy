import express from "express";
import { Request, Response, NextFunction } from "express";
import adminController from "../../modules/admin/controllers/admin.controller";
import * as auth from "../../middleware/auth";
import multer from "multer";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const fileFilter = (req: any, file: any, cb: any) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported"), false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });
const uploadSingle = upload.single("avatar");
const handleUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadSingle(req, res, (err: any) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
    next();
  })
}
const router = express.Router();
router.post("/auth/login", adminController.login);
router.post("/auth/forgot-password", adminController.forgotPassword);
router.post("/auth/reset-password", adminController.resetPassword);
router.post(
  "/auth/update-password",
  auth.verifyAdminToken,
  adminController.changePassword
);
router.get(
  "/auth/profile",
  auth.verifyAdminToken,
  adminController.getProfile
);
router.post(
  "/auth/update-profile",
  auth.verifyAdminToken,
  handleUpload,
  adminController.updateProfile
);
router.post('/update/customer/status/:id', auth.verifyAdminToken, adminController.updateUserStatus)
router.delete('/delete/customer/:id', auth.verifyAdminToken, adminController.deleteUser)
router.get('/get/customers', auth.verifyAdminToken, adminController.getAllUsers)
router.get('/get/customers/search', auth.verifyAdminToken, adminController.searchUser) //search query is term
export default router;
