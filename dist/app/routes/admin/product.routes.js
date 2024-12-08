import express from "express";
import productController from "../../modules/products/controllers/product.controller.js";
import * as auth from "../../middleware/auth.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary.js";
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/uploads");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });
// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => ({
        folder: 'Product', // Replace with your desired folder name
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'], // Allowed formats
        public_id: `${Date.now()}-${file.originalname}`, // Custom public ID
    }),
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/gif") {
        cb(null, true);
    }
    else {
        cb(new Error("File type not supported"), false);
    }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });
const uploadMultiple = upload.array("image");
const handleUploadError = (req, res, next) => {
    uploadMultiple(req, res, (err) => {
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
router.all("*", auth.verifyAdminToken);
router.post("/create", handleUploadError, productController.createProduct);
router.get("/all", productController.getProducts);
router.get("/single/:id", productController.getProduct);
router.post("/update/:id", handleUploadError, productController.updateProduct);
router.post("/update-status/:id", productController.updateProductStatus);
router.delete("/delete/:id", productController.deleteProduct);
export default router;
