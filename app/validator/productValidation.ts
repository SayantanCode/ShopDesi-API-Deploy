import Joi from "joi";

export const productSchema = Joi.object({
    name: Joi.string().required().min(3).messages({
        "string.base": "Product name must be a string",
        "any.required": "Product name is required",
        "string.min": "Product name must be at least 3 characters long",
    }),
    description: Joi.string().required().messages({
        "string.base": "Description must be a string",
        "string.empty": "Description is required",
        "any.required": "Description is required",
    }),
    mrp: Joi.number().required().messages({
        "number.base": "MRP must be a number",
        // "string.empty": "MRP is required",
        "any.required": "MRP is required",
    }),
    costPrice: Joi.number().required().messages({
        "number.base": "Cost price must be a number",
        "any.required": "Cost price is required",
    }),
    sellingPrice: Joi.number().required().messages({
        "number.base": "Selling price must be a number",
        "any.required": "Selling price is required",
    }),
    category: Joi.string().required().messages({
        "string.base": "Category must be a string",
        "string.empty": "Category is required",
        "any.required": "Category is required",
    }),
    subCategory: Joi.string().required().messages({
        "string.base": "Sub category must be a string",
        "string.empty": "Sub category is required",
        "any.required": "Sub category is required",
    }),
    brand: Joi.string().required().messages({
        "string.base": "Brand must be a string",
        "string.empty": "Brand is required",
        "any.required": "Brand is required",
    }),
    stock: Joi.number().required().messages({
        "number.base": "Stock must be a number",
        "any.required": "Stock is required",
    }),
    launchDate: Joi.date().messages({
        "date.base": "Launch date must be a date type",
    }),
})

export const updateProductSchema = Joi.object({
    name: Joi.string().min(3).messages({
        "string.base": "Product name must be a string",
        "string.min": "Product name must be at least 3 characters long",
    }),
    description: Joi.string().messages({
        "string.base": "Description must be a string",
    }),
    mrp: Joi.number().messages({
        "number.base": "MRP must be a number",
    }),
    costPrice: Joi.number().messages({
        "number.base": "Cost price must be a number",
    }),
    sellingPrice: Joi.number().messages({
        "number.base": "Selling price must be a number",
    }),
    category: Joi.string().messages({
        "string.base": "Category must be a string",
    }),
    subCategory: Joi.string().messages({
        "string.base": "Sub category must be a string",
    }),
    brand: Joi.string().messages({
        "string.base": "Brand must be a string",
    }),
    stock: Joi.number().messages({
        "number.base": "Stock must be a number",
    }),
    oldImages: Joi.array().messages({
        "array.base": "Old images must be an array",
    })
})