import asyncHandler from "express-async-handler";
import { Favorite } from "../models/Wishlist.js";

// @desc   Add or remove product from favorites
// @route  POST /api/favorite
// @access User
export const toggleFavorite = asyncHandler(async (req, res) => {
  const { userId, productId } = req.body;

  let favorite = await Favorite.findOne({ userId });
  if (!favorite) {
    favorite = await Favorite.create({ userId, products: [productId] });
    return res.status(201).json({ message: "Added to favorites", favorite });
  }

  const index = favorite.products.findIndex(
    (id) => id.toString() === productId
  );

  if (index > -1) {
    favorite.products.splice(index, 1);
    await favorite.save();
    return res
      .status(200)
      .json({ message: "Removed from favorites", favorite });
  } else {
    favorite.products.push(productId);
    await favorite.save();
    return res.status(200).json({ message: "Added to favorites", favorite });
  }
});

// @desc   Get user's favorites
// @route  GET /api/favorite/:userId
// @access User
export const getFavorites = asyncHandler(async (req, res) => {
  const favorite = await Favorite.findOne({
    userId: req.params.userId,
  });
  if (!favorite) return res.status(404).json({ message: "No favorites found" });

  res.status(200).json(favorite);
});

// @desc   Get user's favorites
// @route  GET /api/favorite/:userId
// @access User
export const DeleteFavorites = asyncHandler(async (req, res) => {
  const Find_favorite = await Favorite.findOne({ products: req.params.id });
  if (!Find_favorite)
    return res.status(404).json({ message: "No favorites found" });

  await Favorite.DeleteOne();
  res.status(200).json(Find_favorite);
});

// @desc   Get top favorite products (most liked by users)
// @route  GET /api/favorite/top
// @access Public
export const getAlotofFavoritesProduct = asyncHandler(async (req, res) => {
  const favorites = await Favorite.aggregate([
    { $unwind: "$products" }, // نفك مصفوفة المنتجات لكل مستخدم
    {
      $group: {
        _id: "$products", // نجمع حسب المنتج
        totalFavorites: { $sum: 1 }, // عدد مرات إضافته للمفضلة
      },
    },
    { $sort: { totalFavorites: -1 } }, // نرتب من الأكثر للمفضلة
    { $limit: 10 }, // نجيب أول 10 منتجات مثلاً
    {
      $lookup: {
        from: "products", // اسم Collection المنتجات
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 0,
        productId: "$product._id",
        name: "$product.Name",
        price: "$product.Price",
        image: "$product.Image.url",
        totalFavorites: 1,
      },
    },
  ]);

  if (!favorites.length) {
    return res.status(404).json({ message: "No favorite products found" });
  }

  res.status(200).json({
    message: "Top favorite products fetched successfully",
    count: favorites.length,
    data: favorites,
  });
});
// 🧠 شرح الكود:
// المرحلة	الوظيفة
// $unwind	يفك كل منتج في المصفوفة products لمستند منفصل
// $group	يجمع كل المنتجات اللي ليها نفس الـ ID
// $sum	يحسب عدد المرات اللي المنتج اتضاف فيها للمفضلة
// $sort	يرتب حسب عدد مرات التفضيل
// $lookup	يربط مع بيانات المنتج من Collection products
// $project	يختار الحقول اللي نعرضها في النتيجة

// 💡 النتيجة:
// هيجيلك JSON بالشكل ده:

// json
// Copy code
// [
//   {
//     "productId": "6710f97a1234abcd5678ef90",
//     "name": "iPhone 15 Pro",
//     "price": 48000,
//     "image": "https://res.cloudinary.com/.../iphone.jpg",
//     "totalFavorites": 32
//   },
//   {
//     "productId": "6710f9b21234abcd5678ef93",
//     "name": "Samsung S24 Ultra",
//     "price": 42000,
//     "image": "https://res.cloudinary.com/.../s24.jpg",
//     "totalFavorites": 27
//   }
// ]
// هل تحب أضيفلك فلتر كمان في الكويري (زي ?category=electronics) عشان تجيب أكثر المنتجات المفضلة داخل فئة معينة فقط؟ ⚙️
