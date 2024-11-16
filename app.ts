import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import connectDb from "./app/config/dbConfig";
import adminRoutes from "./app/routes/admin/admin.routes";
import userRoutes from "./app/routes/api/user.routes";
import adminCarouselRoutes from "./app/routes/admin/carousal.routes";
import adminProductRoutes from "./app/routes/admin/product.routes";
import adminCategoryRoutes from "./app/routes/admin/category.routes";
import adminSubCategoryRoutes from "./app/routes/admin/subCategory.routes";
import adminBrandRoutes from "./app/routes/admin/brand.routes";
import adminDealRoutes from "./app/routes/admin/deal.routes";
import adminOrderRoutes from "./app/routes/admin/order.routes";
import adminReviewRoutes from "./app/routes/admin/review.routes";
import userCarouselRoutes from "./app/routes/api/carousal.routes";
import userProductRoutes from "./app/routes/api/product.routes";
import userCategoryRoutes from "./app/routes/api/category.routes";
import userBrandRoutes from "./app/routes/api/brand.routes";
import userCartRoutes from "./app/routes/api/cart.routes";
import userOrderRoutes from "./app/routes/api/order.routes";
import userReviewRoutes from "./app/routes/api/review.routes";
import multer from "multer";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
dotenv.config();
connectDb();
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(cors(
    {
        origin: ["http://localhost:3000", "http://localhost:3001"],
        // credentials: true,
    }
));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

// routes

// auth routes
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

// other routes admin
app.use("/api/admin/carousel", adminCarouselRoutes);
app.use("/api/admin/product", adminProductRoutes);
app.use("/api/admin/category", adminCategoryRoutes);
app.use("/api/admin/subcategory", adminSubCategoryRoutes);
app.use("/api/admin/brand", adminBrandRoutes);
app.use("/api/admin/deal", adminDealRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/reviews", adminReviewRoutes);

// other routes user
app.use("/api/user/carousel", userCarouselRoutes);
app.use("/api/user/products", userProductRoutes); // deals and all products
app.use("/api/user/categories", userCategoryRoutes); //both are here category and subcategory
app.use("/api/user/brands", userBrandRoutes);
app.use("/api/user/cart", userCartRoutes);
app.use("/api/user", userOrderRoutes); // create order or checkout and view order
app.use("/api/user/reviews", userReviewRoutes); // add review and view review

// after routes add multer error
app.use((err: any, req: any, res: any, next: any)=>{
    if(err instanceof multer.MulterError){
      res.status(400).json({
        success: false,
        message: err.message
      })
    } else {
      next(err)
    }
})
// swaggger
// Swagger options
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Shop_Desi.in E-commerse API',
      version: '1.0.0',
      description: 'Shop Desi API Documentation',
      contact: {
        name: 'Support Team',
        email: 'support@shopdesi.in',
      },
    },
    servers: [
      {
        url: 'http://localhost:1500', // Your API base URL
      },
    ],
  },
  apis: [path.join(__dirname, './swagger.yaml')], // Path to Swagger/OpenAPI file
};

// Initialize swagger-jsdoc
const swaggerDocs = swaggerJsdoc(swaggerOptions);
// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
const PORT = process.env.PORT || 1500;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
