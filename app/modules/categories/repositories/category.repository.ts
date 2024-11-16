import categoryModel from "../models/categoryModel";
import subCategoryModel from "../../subCategories/models/subCategoryModel";
import { ICategory } from "../../../interface/categoryInterface";
import { response } from "../../../helper/response";
import { Status } from "../../../helper/response";
import config from "../../../config";
import fs from "fs";
import productModel from "../../products/models/productModel";
export const createCategory = async (body: ICategory, file: any) => {
    try {
        const { name, description} = body;
        if(!name) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "Category name is required"
            })
        }
        if(!file) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "Category image is required"
            })
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
        })
        if(description) newCategory.description = description
        if(file) newCategory.image = `${config.baseUrl}/uploads/${file.filename}`
        await newCategory.save()
        return response({
            status: Status.CREATED,
            customMessage: "Category created successfully",
            data: newCategory
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })
    }
}

export const getCategories = async () => {
    try {
        const categories = await categoryModel.find();
        return response({
            status: Status.SUCCESS,
            data: categories
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })  
    }
}

export const updateCategory = async (_id: string, body: ICategory, file: any) => {
    try {
        const { name, description} = body;
        if(!_id) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "Category id is required"
            })
        }
        if(!name && !description && !file) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "At least one field is required to update the category"
            })
        }
        const existedCategory = await categoryModel.findById(_id);
        if (!existedCategory) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "Category does not exist",
            });
        }
        const updatedCategory =await categoryModel.findByIdAndUpdate(
            { _id },
            {
                name,
                description
            },
            { new: true }
        )
        if (file) {
            const { filename } = file;
            const image = `${config.baseUrl}/uploads/${filename}`;
            if (updatedCategory && updatedCategory.image) {
              fs.unlinkSync(`public/uploads/${existedCategory.image.split("/").pop()}`);
              updatedCategory.image = image
              await updatedCategory.save();
            }
            if(updatedCategory && !updatedCategory.image) {
              updatedCategory.image = image
              await updatedCategory.save();
            }
          }
        return response({
            status: Status.SUCCESS,
            customMessage: "Category updated successfully",
            data: updatedCategory
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })
    }
}

export const deleteCategory = async (_id: string) => {
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
        if(category.image) {
            fs.unlinkSync(`public/uploads/${category.image.split("/").pop()}`);
        }
        await categoryModel.findByIdAndDelete(_id);
        return response({
            status: Status.DELETED,
            customMessage: "Category deleted successfully",
        });
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })
    }
}

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
        ])
        return response({
            status: Status.SUCCESS,
            data: groupedData
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })
    }
}