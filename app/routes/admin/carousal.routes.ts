import express from "express";
import { Request, Response, NextFunction } from "express";
import carousalController from "../../modules/carousal/controllers/carousal.controller";
import * as auth from "../../middleware/auth";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary";
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
  params: async (req, file) => {
    console.log("File being uploaded:", file); // Log the file info
    return {
      folder: "Carousal",
      allowed_formats: ["jpg", "jpeg", "png"],
      public_id: `${Date.now()}-${file.originalname}`,
    };
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
  const uploadSingle = upload.single("image");
  const handleUpload = (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.file);
    uploadSingle(req, res, (err: any) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: err.message || "Failed to upload image",
        });
      }
      console.log("success");
      next();
    })
  }
const router = express.Router();
router.all("*", auth.verifyAdminToken);
router.post("/create", handleUpload, carousalController.createcarousal);
router.get("/all", carousalController.getCarousal);
router.post("/update/:id", handleUpload, carousalController.updateCarousal);
router.delete("/delete/:id", carousalController.deleteCarousal);
export default router;