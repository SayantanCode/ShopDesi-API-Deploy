import categoryModel from "../models/categoryModel.js";
import subCategoryModel from "../../subCategories/models/subCategoryModel.js";
import { response } from "../../../helper/response.js";
import { Status } from "../../../helper/response.js";
import productModel from "../../products/models/productModel.js";
import cloudinary from "../../../config/cloudinary.js";
export const createCategory = async (body, file) => {
    try {
        const { name, description } = body;
        if (!name) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "Category name is required"
            });
        }
        if (!file) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "Category image is required"
            });
        }
        const existedCategory = await categoryModel.findOne({ name });
        if (existedCategory) {
            return response({
                status: Status.CONFLICT,
                customMessage: "Category already exists",
            });
        }
        const newCategory = new categoryModel({
            name
        });
        if (description)
            newCategory.description = description;
        // if(file) newCategory.image = `${config.baseUrl}/uploads/${file.filename}`
        if (file) {
            const result = await cloudinary.uploader.upload(file.path);
            newCategory.image = result.secure_url;
        }
        await newCategory.save();
        return response({
            status: Status.CREATED,
            customMessage: "Category created successfully",
            data: newCategory
        });
    }
    catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        });
    }
};
export const getCategories = async () => {
    try {
        const categories = await categoryModel.find();
        return response({
            status: Status.SUCCESS,
            data: categories
        });
    }
    catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        });
    }
};
export const updateCategory = async (_id, body, file) => {
    try {
        const { name, description } = body;
        if (!_id) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "Category id is required"
            });
        }
        if (!name && !description && !file) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "At least one field is required to update the category"
            });
        }
        const existedCategory = await categoryModel.findById(_id);
        if (!existedCategory) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "Category does not exist",
            });
        }
        const updatedCategory = await categoryModel.findByIdAndUpdate({ _id }, {
            name,
            description
        }, { new: true });
        // if (file) {
        //     const { filename } = file;
        //     const image = `${config.baseUrl}/uploads/${filename}`;
        //     if (updatedCategory && updatedCategory.image) {
        //       fs.unlinkSync(`public/uploads/${existedCategory.image.split("/").pop()}`);
        //       updatedCategory.image = image
        //       await updatedCategory.save();
        //     }
        //     if(updatedCategory && !updatedCategory.image) {
        //       updatedCategory.image = image
        //       await updatedCategory.save();
        //     }
        //   }
        if (file) {
            // destroy previous image
            if (updatedCategory && updatedCategory.image) {
                const publicId = updatedCategory.image.split('/').pop();
                if (publicId) {
                    const publicIdWithoutExtension = publicId.split('.')[0];
                    await cloudinary.uploader.destroy(publicIdWithoutExtension);
                }
                const result = await cloudinary.uploader.upload(file.path);
                updatedCategory.image = result.secure_url;
                await updatedCategory.save();
            }
        }
        return response({
            status: Status.SUCCESS,
            customMessage: "Category updated successfully",
            data: updatedCategory
        });
    }
    catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        });
    }
};
export const deleteCategory = async (_id) => {
    try {
        const category = await categoryModel.findById(_id);
        if (!category) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "Category does not exist",
            });
        }
        const existedProducts = await productModel.findOne({ category: _id });
        if (existedProducts) {
            return response({
                status: Status.CONFLICT,
                customMessage: "Category cannot be deleted as it has products associated with it. Please delete the products first",
            });
        }
        const subCategories = await subCategoryModel.findOne({ category: _id });
        if (subCategories) {
            return response({
                status: Status.CONFLICT,
                customMessage: "Categories cannot be deleted as it has sub categories associated with it. Please delete the sub-categories first",
            });
        }
        // if(category.image) {
        //     fs.unlinkSync(`public/uploads/${category.image.split("/").pop()}`);
        // }
        if (category.image) {
            const publicId = category.image.split('/').pop();
            if (publicId) {
                const publicIdWithoutExtension = publicId.split('.')[0];
                await cloudinary.uploader.destroy(publicIdWithoutExtension);
            }
        }
        await categoryModel.findByIdAndDelete(_id);
        return response({
            status: Status.DELETED,
            customMessage: "Category deleted successfully",
        });
    }
    catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        });
    }
};
export const groupedCatAndSubCat = async () => {
    try {
        const groupedData = await subCategoryModel.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$category"
            },
            {
                $group: {
                    _id: "$category._id",
                    name: { $first: "$category.name" },
                    description: { $first: "$category.description" },
                    subCategories: { $push: { _id: "$_id", name: "$name" } },
                    image: { $first: "$category.image" }
                }
            }
        ]);
        return response({
            status: Status.SUCCESS,
            data: groupedData
        });
    }
    catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        });
    }
};
