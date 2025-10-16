import Joi from "joi";

export const BookingValidate = Joi.object({
  user: Joi.string(),
  hotel: Joi.string(),
  checkIn: Joi.date().required(),
  checkOut: Joi.date().greater(Joi.ref("checkIn")).required(),
  totalPrice: Joi.number().min(0),
  pricePerDay: Joi.number().min(0),
  status: Joi.string().valid("Pending", "Confirmed", "Cancelled").optional(),
});
