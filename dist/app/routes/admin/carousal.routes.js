import express from "express";
import carousalController from "../../modules/carousal/controllers/carousal.controller.js";
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
router.post("/create", handleUpload, carousalController.createcarousal);
router.get("/all", carousalController.getCarousal);
router.post("/update/:id", handleUpload, carousalController.updateCarousal);
router.delete("/delete/:id", carousalController.deleteCarousal);
export default router;
