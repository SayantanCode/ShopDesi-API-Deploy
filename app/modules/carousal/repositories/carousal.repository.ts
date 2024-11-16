import carousalModel from "../models/carousalModel";
import { response } from "../../../helper/response";
import { Status } from "../../../helper/response";
import config from "../../../config";
import fs from "fs";
export const getCarousal = async () => {
    try {
        const carousal = await carousalModel.find();
        return response({
            status: Status.SUCCESS,
            data: carousal
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })
    }
}

export const addCarousal = async (body: any, file:any) => {
    try {
        const { title } = body
        if(!file){
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "Image is required"
            })
        }
        const newCarousal = new carousalModel({
            title,
        })
        
        newCarousal.image = `${config.baseUrl}/uploads/${file.filename}`
        
        await newCarousal.save()
        return response({
            status: Status.CREATED,
            data: newCarousal
        })
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR
        })
    }
}

export const updateCarousal = async (id: string, body: any, file: any) => {
    try {
        if (!id) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "Carousal id is required to update the carousal",
            });
        }
        const { title } = body
        if (!title && !file) {
            return response({
                status: Status.BAD_REQUEST,
                customMessage: "No data to update",
            });
        }
        const updatedCarousal = await carousalModel.findByIdAndUpdate(id, {
            title
        }, { new: true });
        
        if (updatedCarousal) {
            // Access the updatedCarousal variable safely
            if (file) {
                if (updatedCarousal.image) {
                    fs.unlinkSync(`public/uploads/${updatedCarousal.image.split("/").pop()}`);
                }
                updatedCarousal.image = `${config.baseUrl}/uploads/${file.filename}`;
                await updatedCarousal.save();
            }
            return response({
                status: Status.SUCCESS,
                customMessage: "Carousal updated successfully",
                data: updatedCarousal,
            });
        } else {
            // Handle the case when updatedCarousal is null
            return response({
                status: Status.NOT_FOUND,
                customMessage: "Carousal not found",
            });
        }
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR,
        });
    }
}
export const deleteCarousal = async (id: string) => {
    try {
        const carousal = await carousalModel.findById(id);
        if (!carousal) {
            return response({
                status: Status.NOT_FOUND,
                customMessage: "Carousal not found",
            });
        }
        if (carousal.image) {
            fs.unlinkSync(`public/uploads/${carousal.image.split("/").pop()}`);
        }
        await carousalModel.findByIdAndDelete(id);
        return response({
            status: Status.SUCCESS,
            customMessage: "Carousal deleted successfully",
        });
    } catch (error) {
        console.log(error);
        return response({
            status: Status.SERVER_ERROR,
        });
    }
}