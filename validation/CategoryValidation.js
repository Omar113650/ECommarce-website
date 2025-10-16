import Joi from "joi";

export const CategoryValidate = Joi.object({
  name: Joi.string()
    .min(5)
    .valid(
      "Beverages",
      "Biscuits & Snacks",
      "Breads & Bakery",
      "Breakfast & Dairy",
      "Frozen Foods",
      "Fruits & Vegetables",
      "Grocery & Staples",
      "Meats & Seafood"
    )
   
});
