import subCategoryModel from "../models/subCategoryModel";
import categoryModel from "../../categories/models/categoryModel";
import { ISubCategory } from "../../../interface/subCategoryInterface";
import mongoose from "mongoose";
import { response } from "../../../helper/response";
import { Status } from "../../../helper/response";
import productModel from "../../products/models/productModel";

export const createSubCategory = async (body: ISubCategory) => {
    try {
        const { name, category } = body;
        if(!name || !category) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "SubCategory name and category id is required"
            })
        }
        const existedSubCategory = await subCategoryModel.findOne({ name });
        if (existedSubCategory) {
            return response({
                status: Status.CONFLICT,
                customMessage: "SubCategory already exists",
            });
        }
        const newSubCategory = new subCategoryModel({
            name
        })
        if(category) newSubCategory.category = category
        await newSubCategory.save()
        return response({
            status: Status.CREATED,
            customMessage: "SubCategory created successfully",
            data: newSubCategory
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })
    }
}

export const getSubCategories = async () => {
    try {
        const subCategories = await subCategoryModel.find();
        return response({
            status: Status.SUCCESS,
            data: subCategories
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })
    }
}


export const updateSubCategory = async (body: ISubCategory, _id: string) => {
    try {
        const { name, category} = body;
        if(!name || !category) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "SubCategory name and category id is required"
            })
        }
        const existedCategory = await categoryModel.findById(category);
        if (!existedCategory) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "Category does not exist",
            });
        }
        const updatedSubCategory = await subCategoryModel.findByIdAndUpdate(
            _id,
            {
                name,
                category
            },
            { new: true }
        )
        if(!updatedSubCategory) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "SubCategory does not exist",
            });
        }
        const product =await productModel.updateMany({subCategory: _id}, {category: updatedSubCategory.category}, {new: true})
        console.log(product);
        return response({
            status: Status.SUCCESS,
            customMessage: "SubCategory updated successfully",
            data: updatedSubCategory
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })
    }
}

export const deleteSubCategory = async (_id: string) => {
    try {
        const existedSubCategory = await subCategoryModel.findById(_id);
        if (!existedSubCategory) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "SubCategory does not exist",
            });
        }
        const existedProducts = await productModel.findOne({ subCategory: _id });
        if (existedProducts) {
            return response({
                status: Status.CONFLICT,
                customMessage: "SubCategory cannot be deleted as it has products associated with it. Please delete the products first",
            })
        }
        await subCategoryModel.findByIdAndDelete(_id)
        return response({
            status: Status.SUCCESS,
            customMessage: "SubCategory deleted successfully",
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })
    }
}