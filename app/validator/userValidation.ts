import Joi from "joi";

export const userSignupSchema = Joi.object({
    name: Joi.string().required().min(3).messages({
        "string.base": "Name must be a string",
        "any.required": "Name is required",
        "string.min": "Name must be at least 3 characters long",
    }),
    email: Joi.string().email().required().messages({
        "string.base": "Email must be a string",
        "string.empty": "Email is required",
        "any.required": "Email is required",
        "string.email": "Email must be valid"
    }),
    password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/).required().messages({
        "string.base": "Password must be a string",
        "string.empty": "Password is required",
        "any.required": "Password is required",
        "string.pattern.base": "Password must be at least 8 characters long and at most 15 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character"
    }),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
        "any.only": "Passwords do not match",
        "string.empty": "Confirm password is required",
        "any.required": "Confirm password is required"
    }),
});

export const userLoginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.base": "Email must be a string",
        "string.empty": "Email is required",
        "any.required": "Email is required",
        "string.email": "Email must be valid"
    }),
    password: Joi.string().required().messages({
        "string.base": "Password must be a string",
        "string.empty": "Password is required",
        "any.required": "Password is required",
    }),
})

export const userUpdateSchema = Joi.object({
    name: Joi.string().required().min(3).messages({
        "string.base": "Name must be a string",
        "any.required": "Name is required",
        "string.min": "Name must be at least 3 characters long",
    }),
    email: Joi.string().email().required().messages({
        "string.base": "Email must be a string",
        "string.empty": "Email is required",
        "any.required": "Email is required",
        "string.email": "Email must be valid"
    }),
    phone: Joi.string().allow('',null,"null").length(10).messages({
        "string.base": "Phone must be a string",
        "string.length": "Phone number must be 10 characters long",
    }),
    address: Joi.string().allow('',null,"null").min(3).messages({
        "string.base": "Address must be a string",
    }),
    avatar: Joi.string().messages({
        "string.base": "Avatar must be a string",
    }),
})