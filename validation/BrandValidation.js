import Joi from "joi";

export const BrandValidate = Joi.object({
  Name: Joi.string()
    .min(5)
    .valid("Frito Lay", " Quaker", "Cola", "Orea", "Welchs")
    .optional(),
});
