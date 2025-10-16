import Joi from "joi";

export const BlogValidation = Joi.object({
  title: Joi.string().min(5).max(150).required(),
  content: Joi.string().min(20).required(),
  Image: Joi.object({
    url: Joi.string().uri().allow(""),
    publicId: Joi.string().allow(null, ""),
  }).optional(),
  author: Joi.string().min(3).max(50).optional(),
  Tags: Joi.string()
    .valid(
      "grocery",
      "food",
      "shop",
      "store",
      "shopify",
      "ecommerce",
      "organic",
      "klbtheme"
    )
    .default("grocery"),
});
