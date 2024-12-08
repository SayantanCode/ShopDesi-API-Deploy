import express from "express";
import categoryController from "../../modules/categories/controllers/category.controller.js";
import * as auth from "../../middleware/auth.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary.js";
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, "public/uploads");
//     },
//     filename: (req, file, cb) => {
//       cb(null, Date.now() + "-" + file.originalname);
//     },
//   });
// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => ({
        folder: 'Product-Category', // Replace with your desired folder name
        allowed_formats: ['jpg', 'jpeg', 'png'], // Allowed formats
        public_id: `${Date.now()}-${file.originalname}`, // Custom public ID
    }),
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
const uploadSingle = upload.single("image");
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
router.all("*", auth.verifyAdminToken);
router.post("/create", handleUpload, categoryController.createCategory);
router.get("/all", categoryController.getCategories);
router.post("/update/:id", handleUpload, categoryController.updateCategory);
router.delete("/delete/:id", categoryController.deleteCategory);
export default router;
