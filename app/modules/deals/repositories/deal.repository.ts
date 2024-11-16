import dealModel from "../models/dealModel";
import productModel from "../../products/models/productModel";
import { IDeal } from "../../../interface/dealInterface";
import { response } from "../../../helper/response";
import { Status } from "../../../helper/response";

export const createDeal = async (body: IDeal) => {
    try {
        const {dealStart, dealEnd, discountedPercentage, product} = body;
        if(!dealStart || !dealEnd || !discountedPercentage || !product) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "All fields are required"
            })
        }
        if(dealStart >= dealEnd) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "Deal start date cannot be greater than deal end date or equal to deal end date"
            })
        }
        const existedProduct = await productModel.findById(product);
        if(!existedProduct) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "Product not found"
            })
        }
        if(discountedPercentage < existedProduct.discount) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: `You cant set discount percentage less than current product discount percentage of ${existedProduct.discount}%`
            })
        }
        if(discountedPercentage > 100 || discountedPercentage < 0) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "You cant set discount percentage greater than 100 or less than 0"
            })
        }
        const calculatedSellingPrice = existedProduct.mrp - (existedProduct.mrp * discountedPercentage)/100;
        console.log(calculatedSellingPrice);
        const existedDeal = await dealModel.findOne({
            product,
        })
        if(existedDeal) {
            return response({
                status: Status.CONFLICT,
                customMessage: "Deal already exists for this product. You can update it"
            })
        }
        const newDeal = new dealModel({
            dealStart,
            dealEnd,
            discountedPrice: calculatedSellingPrice,
            discountedPercentage: Math.round(discountedPercentage * 100) / 100,
            product
        })
        await newDeal.save();
        return response({
            status: Status.CREATED,
            forTerm: "Deal",
            data: newDeal
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR,
        })
    }
}

export const getDeals = async () => {
    try {
        const deals = await dealModel.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $project: {
                    dealStart: 1,
                    dealEnd: 1,
                    discountedPrice: 1,
                    discountedPercentage: 1,
                    product: 1
                }
            }
        ]);
        return response({
            status: Status.SUCCESS,
            data: deals
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })
    }
}

export const deleteDeal = async (_id: string) => {
    try {
        const deal = await dealModel.findById(_id);
        if(!deal) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "Deal not found"
            })
        }
        await dealModel.findByIdAndDelete(_id);
        return response({
            status: Status.DELETED,
            customMessage: "Deal deleted successfully"
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })
    }
}

export const updateDeal = async (_id: string, body: IDeal) => {
    try {
        const deal = await dealModel.findById(_id);
        if(!deal) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "Deal not found"
            })
        }
        const {dealStart, dealEnd, discountedPercentage, product} = body;
        if(!dealStart && !dealEnd && !discountedPercentage && !product) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "At least one field is required to update"
            })
        }
        if(dealStart && dealStart >= dealEnd) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "Deal start date cannot be greater than deal end date or equal to deal end date"
            })
        }
        const existedProduct = await productModel.findById(product);
        if(!existedProduct) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "Product not found"
            })
        }
        const discountedPrice = (existedProduct.mrp - (existedProduct.mrp * discountedPercentage)/100);
        deal.dealStart = dealStart;
        deal.dealEnd = dealEnd;
        deal.discountedPrice = discountedPrice;
        deal.discountedPercentage = Math.round(discountedPercentage * 100) / 100;
        deal.product = product;
        await deal.save();
        return response({
            status: Status.UPDATED,
            forTerm: "Deal",
            data: deal
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })
    }
}