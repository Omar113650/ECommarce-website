import Joi from "joi";
import mongoose from "mongoose";

export const ProductValidation = Joi.object({
  Name: Joi.string().min(3).max(100).required(),
  Image: Joi.object({
    url: Joi.string().uri().allow(""),
    publicId: Joi.string().allow(null, ""),
  }).optional(),
  categoryId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required(),
  Brand: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required(),
  available: Joi.string().valid("InStock", "OutOfStock").default("InStock"),
  Price: Joi.number().min(0).required(),
  review: Joi.number().valid(1, 2, 3, 4, 5).default(5),
  Time: Joi.date().optional().allow(null),
});
