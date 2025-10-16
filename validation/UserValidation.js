import Joi from "joi";
import PasswordComplexity from "joi-password-complexity";

export const UserValidate = Joi.object({
  Name: Joi.string().min(3).max(20).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name must not exceed 20 characters",
  }),

  Email: Joi.string()
    .email({ tlds: { allow: false } })
    .min(10)
    .max(50)
    .required()
    .messages({
      "string.email": "Invalid email format",
      "string.empty": "Email is required",
    }),

  Phone: Joi.string()
    .pattern(/^01[0-9]{9}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid Egyptian phone number format (e.g., 01012345678)",
      "string.empty": "Phone number is required",
    }),
  Password: PasswordComplexity().required(),
  role: Joi.string().valid("Admin", "Customer").default("Customer"),
});
