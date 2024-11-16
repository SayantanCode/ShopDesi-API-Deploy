import productModel from "../models/productModel";
import dealModel from "../../deals/models/dealModel";
import cartModel from "../../cart/models/cartModel";
import { IProduct } from "../../../interface/productInterface";
import {
  productSchema,
  updateProductSchema,
} from "../../../validator/productValidation";
import config from "../../../config";
import { response } from "../../../helper/response";
import { Status } from "../../../helper/response";
import mongoose from "mongoose";
import fs from "fs";
import reviewModel from "../../reviews/models/reviewModel";

export const createProduct = async (body: IProduct, files: any) => {
  try {
    let {
      name,
      description,
      mrp,
      costPrice,
      sellingPrice,
      category,
      subCategory,
      brand,
      stock,
      launchDate,
    } = body;
    const { error } = productSchema.validate(body, { abortEarly: false });
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      return response({
        status: Status.BAD_REQUEST,
        customMessage: errorMessage,
      });
    }
    console.log(mrp);
    console.log(sellingPrice);
    console.log(costPrice);
    if(typeof(mrp)!=="number" || typeof(sellingPrice)!=="number" || typeof(costPrice)!=="number") {
        mrp = Number(mrp);
        sellingPrice = Number(sellingPrice);
        costPrice = Number(costPrice);
    }
    if(mrp<sellingPrice) {
        return response({
            status: Status.BAD_REQUEST,
            customMessage: "MRP cannot be less than selling price"
        })
    }
    if(mrp<costPrice) {
        return response({
            status: Status.BAD_REQUEST,
            customMessage: "MRP cannot be less than cost price"
        })
    }
    if(costPrice>sellingPrice) {
        return response({
            status: Status.BAD_REQUEST,
            customMessage: "Selling price cannot be less than cost price"
        })
    }
    const existedProduct = await productModel.findOne({
      name,
      category,
      subCategory,
      brand,
      mrp,
      sellingPrice,
    });
    if (existedProduct) {
      return response({
        status: Status.CONFLICT,
        customMessage: "Product already exists",
      });
    }
    const newProduct = new productModel({
      name,
      description,
      mrp,
      costPrice,
      sellingPrice,
      discount: Math.round(((mrp - sellingPrice) / mrp) * 100*100)/100,
      category,
      subCategory,
      brand,
      stock,
    });
    if (launchDate) {
      newProduct.launchDate = launchDate;
      newProduct.status = "Scheduled";
    }
    if (files) {
      for (let file of files) {
        newProduct.image.push(`${config.baseUrl}/uploads/${file.filename}`);
      }
    }
    await newProduct.save();
    return response({
      status: Status.CREATED,
      customMessage: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};

export const getProducts = async (
  query: any,
  deals: boolean,
  role?: string
) => {
  try {
    const {
      page = 1,
      limit,
      category,
      subCategory,
      brand,
      range,
      rating = 0,
      sort = "createdAt",
      order = "desc",
      search
    } = query;

    if (page < 1 || limit < 1) {
      return response({
        status: Status.BAD_REQUEST,
        customMessage: "Invalid page or limit",
      });
    }

    const skip = (page - 1) * limit;

    // Update Scheduled products to Active if launchDate has passed
    await productModel.updateMany({
      launchDate: { $lte: new Date() },
      status: "Scheduled"
    }, {
      $set: { status: "Active" }
    });

    const pipeline: any[] = [
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategory",
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $unwind: "$subCategory",
      },
      {
        $unwind: "$brand",
      },
      {
        $project: {
          name: 1,
          description: 1,
          mrp: 1,
          costPrice: 1,
          sellingPrice: 1,
          discount: 1,
          category: "$category.name",
          subCategory: "$subCategory.name",
          brand: "$brand.name",
          stock: 1,
          image: 1,
          launchDate: 1,
          status: 1,
          totalRating: 1,
          rating: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      }
    ];

    // Match products based on role (non-admin users only see active products)
    if (role !== "admin") {
      pipeline.unshift({ $match: { status: "Active" } });
    }

    // Apply search filter
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { "category": { $regex: search, $options: "i" } },
            { "subCategory": { $regex: search, $options: "i" } },
            { "brand": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // Add category filtering
    if (category) {
      const categories = category.split(",");
      pipeline.push({
        $match: {
          "category": { $in: categories },
        },
      });
    }

    // Add subcategory filtering
    if (subCategory) {
      const subCategories = subCategory.split(",");
      pipeline.push({
        $match: {
          "subCategory": { $in: subCategories },
        },
      });
    }

    // Add brand filtering
    if (brand) {
      const brands = brand.split(",");
      pipeline.push({
        $match: {
          "brand": { $in: brands },
        },
      });
    }

    // Filter by rating
    if (rating) {
      pipeline.push({
        $match: {
          rating: { $gte: Number(rating) },
        },
      });
    }
    
    // Find total products count after all filters
    const totalFilteredProducts = await productModel.aggregate([
      ...pipeline,
      { $count: "total" },
    ]);
    console.log(totalFilteredProducts, "totalFilteredProducts");
    // Apply sorting
    pipeline.push({
      $sort: {
        [sort]: order === "asc" ? 1 : -1,
      },
    });

    // // Apply pagination (skip and limit)
    // if (skip) {
    //   pipeline.push({ $skip: skip });
    // }
    // if (limit) {
    //   pipeline.push({ $limit: parseInt(limit) });
    // }

    // Get filtered and paginated products
    let products = await productModel.aggregate(pipeline);
    console.log(products, "products");
    // Apply active deals
    let productWithDeals = await Promise.all(
      products.map(async (product) => {
        const deal = await dealModel.findOne({
          product: product._id,
          dealStart: { $lte: new Date() },
          dealEnd: { $gt: new Date() },
        });
        if (deal) {
          product.oldPrice = product.sellingPrice;
          product.sellingPrice = deal.discountedPrice;
          product.discount = Math.round(deal.discountedPercentage * 100) / 100;
          product.dealEnd = deal.dealEnd;
        }
        return product;
      })
    );

    // Filter products based on price range after deals
    if (range) {
      const [min, max] = range.split("-");
      productWithDeals = productWithDeals.filter(
        (product) =>
          product.sellingPrice >= min && product.sellingPrice <= max
      );
    }
    // totalProducts after all filters
    let totalProducts = productWithDeals.length
    console.log(totalProducts, "totalProd");
    //Pagination
    if (skip) {
      productWithDeals = productWithDeals.slice(skip);
    }
    if (limit) {
      productWithDeals = productWithDeals.slice(0, limit);
    }

    // Show only active deals if requested
    if (deals) {
      productWithDeals = productWithDeals.filter(
        (product) => product.dealEnd && product.dealEnd > new Date()
      );
    }

    totalProducts = totalProducts > 0
      ? totalProducts
      : 0;

    return response({
      status: Status.SUCCESS,
      data: {
        products: productWithDeals,
        totalProducts,
        totalPages: limit ? Math.ceil(totalProducts / limit) : 1,
        showing: limit
          ? ((page - 1) * limit + 1) + "-" + Math.min(page * limit, totalProducts)
          : `1-${productWithDeals.length}`,
      },
    });
  } catch (error) {
    console.error(error);
    return response({
      status: Status.SERVER_ERROR,
      customMessage: "Failed to fetch products",
    });
  }
};

// get single product
export const getProduct = async (_id: string, role?: string) => {
  try {
    if (!_id) {
      return response({
        status: Status.BAD_REQUEST,
        customMessage: "productId is required",
      });
    }
    let pipeline: any = [
      // { $match: { _id: new mongoose.Types.ObjectId(_id) } },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategory",
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: "$category" },
      { $unwind: "$subCategory" },
      { $unwind: "$brand" },
      {
        $project: {
          name: 1,
          description: 1,
          mrp: 1,
          costPrice: 1,
          sellingPrice: 1,
          discount: 1,
          category: "$category.name",
          categoryId: "$category._id",
          subCategory: "$subCategory.name",
          subCategoryId: "$subCategory._id",
          brand: "$brand.name",
          brandId: "$brand._id",
          stock: 1,
          image: 1,
          launchDate: 1,
          status: 1,
          totalRating: 1,
          rating: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    if (role === "admin") {
      pipeline.unshift({ $match: { _id: new mongoose.Types.ObjectId(_id) } });
    }else{
      pipeline.unshift({ $match: { _id: new mongoose.Types.ObjectId(_id), status: "Active" } });
    }
    let product = await productModel.aggregate(pipeline);

    if (product.length === 0) {
      return response({
        status: Status.NOT_FOUND,
        customMessage: "This Product is removed from our store",
      });
    }

    // Find active deals and add deal end time to product with active deals
    const deal = await dealModel.findOne({
      product: _id,
      dealStart: { $lte: new Date() },
      dealEnd: { $gte: new Date() },
    });

    if (deal) {
      product[0].oldPrice = product[0].sellingPrice;
      product[0].sellingPrice = deal.discountedPrice;
      product[0].discount = Math.round(deal.discountedPercentage * 100) / 100;
      product[0].dealEnd = deal.dealEnd;
    }

    return response({ status: Status.SUCCESS, data: product });
  } catch (error) {
    console.log(error);
    return response({ status: Status.SERVER_ERROR });
  }
};
export const updateProduct = async (
  _id: string,
  body: IProduct,
  files: any
) => {
  try {
    let {
      name,
      description,
      mrp,
      costPrice,
      sellingPrice,
      category,
      subCategory,
      brand,
      stock,
      oldImages,
    } = body;

    const { error } = updateProductSchema.validate(body, { abortEarly: false });
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      return response({
        status: Status.BAD_REQUEST,
        customMessage: errorMessage,
      });
    }
    if(typeof(mrp)!=="number" || typeof(sellingPrice)!=="number" || typeof(costPrice)!=="number") {
      mrp = Number(mrp);
      sellingPrice = Number(sellingPrice);
      costPrice = Number(costPrice);
  }
    if(mrp < sellingPrice){
      return response({
        status: Status.BAD_REQUEST,
        customMessage: "MRP cannot be less than selling price",
      });
    }
    if(mrp < costPrice){
      return response({
        status: Status.BAD_REQUEST,
        customMessage: "MRP cannot be less than cost price",
      });
    }
    if(sellingPrice < costPrice){
      return response({
        status: Status.BAD_REQUEST,
        customMessage: "Selling price cannot be less than cost price",
      });
    }

    if (!_id) {
      return response({
        status: Status.BAD_REQUEST,
        customMessage: "Product id is required to update the product",
      });
    }
    const existedProduct = await productModel.findById(_id);
    if (!existedProduct) {
      return response({
        status: Status.NOT_FOUND,
        customMessage: "Product not found",
      });
    }
    if(oldImages && oldImages.length===0 && !files){
      return response({
        status: Status.BAD_REQUEST,
        customMessage: "Please provide at least one image to update the product",
      });
    }
    const updatedProduct = await productModel.findByIdAndUpdate(
      { _id },
      {
        name,
        description,
        mrp,
        costPrice,
        sellingPrice,
        discount: Math.round(((mrp - sellingPrice) / mrp) * 100*100)/100,
        category,
        subCategory,
        brand,
        stock,
      },
      { new: true }
    );
    if (!updatedProduct) {
      return response({
        status: Status.NOT_FOUND,
        customMessage: "Product not found",
      });
    }
    if (oldImages && oldImages.length > 0) {
      // tally old images with update product images
      const deletableImages = updatedProduct.image.filter(
        (image) => !oldImages.includes(image)
      );
      for (let image of deletableImages) {
        fs.unlinkSync(`public/uploads/${image.split("/").pop()}`);
        updatedProduct.image = updatedProduct.image.filter(
          (img) => img !== image
        );
      }
    }else{
      updatedProduct.image = [];
    }
    console.log(updatedProduct.image,"after old delete");
    if (files) {
      for (let file of files) {
        updatedProduct &&
          updatedProduct.image.push(
            `${config.baseUrl}/uploads/${file.filename}`
          );
      }
    }

    await updatedProduct.save();
    return response({
      status: Status.SUCCESS,
      customMessage: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};
export const updateProductStatus = async (_id: string, status: string) => {
  try {
    const product = await productModel.findById(_id);
    if (!product) {
      return response({
        status: Status.NOT_FOUND,
        customMessage: "Product does not exist",
      });
    }
    product.status = status;
    await product.save();
    return response({
      status: Status.SUCCESS,
      customMessage: `Product status updated to '${status}' successfully`,
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};
export const deleteProduct = async (_id: string) => {
  try {
    const product = await productModel.findById(_id);
    if (!product) {
      return response({
        status: Status.NOT_FOUND,
        customMessage: "Product does not exist",
      });
    }
    // 1st Delete product from carts
    await cartModel.deleteMany(
      { productId: _id }
    );

    // 2nd Remove associated deal
    await dealModel.findOneAndDelete({ product: _id });
    // 3rd Delete associated reviews
    await reviewModel.deleteMany({ productId: _id });
    // 4th Delete main product along with images
    if (product && product.image.length > 0) {
      for (let image of product.image) {
        fs.unlinkSync(`public/uploads/${image.split("/").pop()}`);
      }
    }
    await productModel.findByIdAndDelete({ _id });
    return response({
      status: Status.SUCCESS,
      customMessage: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};
// export const searchProduct = async (query: any) => {
//   try {
//     const products = await productModel.aggregate([
//       {
//         $facet: {
//           suggestions: [
//             {
//               $match: {
//                 $or: [
//                   { name: { $regex: query, $options: "i" } },
//                   { description: { $regex: query, $options: "i" } },
//                   { category: { $regex: query, $options: "i" } },
//                   { subCategory: { $regex: query, $options: "i" } },
//                   { brand: { $regex: query, $options: "i" } },
//                 ],
//               },
//             },
//             { $limit: 10 },
//             {
//               $project: {
//                 name: 1,
//                 description: 1,
//                 mrp: 1,
//                 costPrice: 1,
//                 sellingPrice: 1,
//                 discount: 1,
//                 category: "$category.name",
//                 subCategory: "$subCategory.name",
//                 brand: "$brand.name",
//                 stock: 1,
//                 image: 1,
//                 launchDate: 1,
//                 status: 1,
//                 totalRating: 1,
//                 rating: 1,
//                 createdAt: 1,
//                 updatedAt: 1,
//               },
//             },
//           ],
//           results: [
//             {
//               $match: {
//                 $or: [
//                   { name: { $regex: query, $options: "i" } },
//                   { description: { $regex: query, $options: "i" } },
//                   { category: { $regex: query, $options: "i" } },
//                   { subCategory: { $regex: query, $options: "i" } },
//                   { brand: { $regex: query, $options: "i" } },
//                 ],
//               },
//             },
//             {
//               $project: {
//                 name: 1,
//                 description: 1,
//                 mrp: 1,
//                 costPrice: 1,
//                 sellingPrice: 1,
//                 discount: 1,
//                 category: "$category.name",
//                 subCategory: "$subCategory.name",
//                 brand: "$brand.name",
//                 stock: 1,
//                 image: 1,
//                 launchDate: 1,
//                 status: 1,
//                 totalRating: 1,
//                 rating: 1,
//                 createdAt: 1,
//                 updatedAt: 1,
//               },
//             },
//             { $sort: { createdAt: -1 } },
//             { $limit: 50 },
//           ],
//         },
//       },
//       {
//         $lookup: {
//           from: "categories",
//           localField: "results.category",
//           foreignField: "_id",
//           as: "results.category",
//         },
//       },
//       {
//         $lookup: {
//           from: "subcategories",
//           localField: "results.subCategory",
//           foreignField: "_id",
//           as: "results.subCategory",
//         },
//       },
//       {
//         $lookup: {
//           from: "brands",
//           localField: "results.brand",
//           foreignField: "_id",
//           as: "results.brand",
//         },
//       },
//       {
//         $unwind: "$results.category",
//       },
//       {
//         $unwind: "$results.subCategory",
//       },
//       {
//         $unwind: "$results.brand",
//       },
//     ]);

//     return response({
//       status: Status.SUCCESS,
//       data: {
//         results: products[0].results,
//         suggestions: products[0].suggestions,
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     return response({ status: Status.SERVER_ERROR });
//   }
// };
export const searchSuggestions = async () => {
  try {
    const products = await productModel.aggregate([
      {
        $match: {
          status: "Active"
        }
      },
      {
        $project: {
          name: 1,
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ])

    return response({
      status: Status.SUCCESS,
      data: products
    })
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR
    })
  }
}
export const randomRelatedProducts = async (_id: string, query: any) => {
  try {
    const product = await productModel.findById(_id);
    if (!product) {
      return response({
        status: Status.NOT_FOUND,
        customMessage: "Product does not exist",
      });
    }
    const { limit = 10 } = query;
    let products = await productModel.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategory",
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $match: {
          $or: [
            { "category._id": new mongoose.Types.ObjectId(product.category) },
            { "subCategory._id": new mongoose.Types.ObjectId(product.subCategory) },
            { "brand._id": new mongoose.Types.ObjectId(product.brand) },
          ],
          _id: { $ne: new mongoose.Types.ObjectId(product._id) },
        },
    
      },
      {
        $sample: {
          size: limit * 3, // 3 times the limit to get enough related products
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          mrp: 1,
          costPrice: 1,
          sellingPrice: 1,
          discount: 1,
          category: "$category.name",
          subCategory: "$subCategory.name",
          brand: "$brand.name",
          stock: 1,
          image: 1,
          launchDate: 1,
          status: 1,
          totalRating: 1,
          rating: 1,
          createdAt: 1,
          updatedAt: 1,
      }
      },
    ]);
    let productWithDeals = await Promise.all(
      products.map(async (product) => {
        const deal = await dealModel.findOne({
          product: product._id,
          dealStart: { $lte: new Date() },
          dealEnd: { $gte: new Date() },
        });
        if (deal) {
          product.oldPrice = product.sellingPrice;
          product.sellingPrice = deal.discountedPrice;
          product.discount = Math.round(deal.discountedPercentage * 100) / 100;
          product.dealEnd = deal.dealEnd;
        }
        return product;
      })
    );
    
    // Shuffle the related products
    for (let i = productWithDeals.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [productWithDeals[i], productWithDeals[j]] = [productWithDeals[j], productWithDeals[i]];
    }

    return response({
      status: Status.SUCCESS,
      data: productWithDeals.slice(0, limit), // Return only the limited number of products
    });
  } catch (error) {
    console.log(error);
    return response({
      status: Status.SERVER_ERROR,
    });
  }
};
