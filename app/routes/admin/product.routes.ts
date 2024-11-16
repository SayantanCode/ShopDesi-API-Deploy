import express from "express";
import { Request, Response, NextFunction } from "express";
import productController from "../../modules/products/controllers/product.controller";
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
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/gif"
  ) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported"), false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });
const uploadMultiple = upload.array("image");
const handleUploadError = (req: Request, res: Response, next: NextFunction) => {
  uploadMultiple(req, res, (err: any) => {
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
router.all("*", auth.verifyAdminToken);
router.post("/create", handleUploadError, productController.createProduct);
router.get("/all", productController.getProducts);
router.get("/single/:id", productController.getProduct);
router.post("/update/:id", handleUploadError, productController.updateProduct);
router.post("/update-status/:id", productController.updateProductStatus);
router.delete("/delete/:id", productController.deleteProduct);
export default router;
