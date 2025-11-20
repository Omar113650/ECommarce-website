import mongoose from "mongoose";

export const ValidatedID = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  next();
};







// export const ValidatedID = (req, res, next) => {
//   const id = req.params.id;
  
//   const isValid = /^[0-9a-fA-F]{24}$/.test(id);
  
//   if (!isValid) {
//     return res.status(400).json({ message: "Invalid ID" });
//   }

//   next();
// };
