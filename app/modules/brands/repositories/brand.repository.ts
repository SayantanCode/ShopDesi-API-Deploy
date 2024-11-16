import brandModel from "../models/brandModel";
import { IBrand } from "../../../interface/brandInterface";
import { response } from "../../../helper/response";
import { Status } from "../../../helper/response";
import productModel from "../../products/models/productModel";

export const createBrand = async (body: IBrand) => {
    try {
        const { name, description, logo } = body;
        if(!name) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "Brand name is required"
            })
        }
        const existedBrand = await brandModel.findOne({ name });
        if (existedBrand) {
            return response({
                status: Status.CONFLICT,
                customMessage: "Brand already exists",
            });
        }
        const newBrand = new brandModel({
            name
        })
        if(description) newBrand.description = description
        if(logo) newBrand.logo = logo
        await newBrand.save()
        return response({
            status: Status.CREATED,
            customMessage: "Brand created successfully",
            data: newBrand
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })
    }
}

export const getBrands = async () => {
    try {
        const brands = await brandModel.find();
        return response({
            status: Status.SUCCESS,
            data: brands
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })  
    }
}

export const updateBrand = async (id: string, body: IBrand) => {
    try {
        const { name, description, logo } = body;
        if(!id || id === "undefined") {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "Brand id is required to update the brand"
            })
        }
        if(!name && !description && !logo) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "At least one field is required to update"
            })
        }
        const updatedBrand = await brandModel.findByIdAndUpdate(id, {
            name,
            description,
            logo
        }, { new: true })
        if(!updatedBrand) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "Brand does not exist",
            });
        }
        return response({
            status: Status.UPDATED,
            customMessage: "Brand updated successfully",
            data: updatedBrand
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })
    }
}

export const deleteBrand = async (id: string) => {
    try {
        if(!id) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "Brand id is required to delete the brand"
            })
        }
        const existedProduct = await productModel.findOne({ brand: id });
        if (existedProduct) {
            return response({
                status: Status.CONFLICT,
                customMessage: "This Brand is associated with a product. Please delete the product/products first",
            });
        }
        const deletedBrand = await brandModel.findByIdAndDelete(id);
        if(!deletedBrand) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "Brand does not exist",
            });
        }
        return response({
            status: Status.DELETED,
            customMessage: "Brand deleted successfully",
            data: deletedBrand
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })
    }
}