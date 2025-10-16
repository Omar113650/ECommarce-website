import Joi from "joi";

export const ContactUsValidation = Joi.object({
  Name: Joi.string()
    .min(3)
    .max(50)
    .trim()
    .required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 3 characters long",
    }),

  Phone: Joi.string()
    .length(11)
    .pattern(/^01[0-9]{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be a valid Egyptian number (e.g., 01012345678)",
      "string.length": "Phone number must be exactly 11 digits",
    }),

  Email: Joi.string()
    .email({ tlds: { allow: false } }) 
    .required()
    .messages({
      "string.email": "Invalid email format",
      "string.empty": "Email is required",
    }),

  Message: Joi.string()
    .min(10)
    .max(300)
    .required()
    .messages({
      "string.min": "Message must be at least 10 characters",
      "string.max": "Message cannot exceed 300 characters",
      "string.empty": "Message is required",
    }),
});
