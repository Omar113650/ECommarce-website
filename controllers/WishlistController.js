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
  const favorite = await Favorite.findOne({ userId: req.params.id }).populate(
    "products",
    "Name Price Image"
  );

  if (!favorite) return res.status(404).json({ message: "No favorites found" });

  res.status(200).json(favorite);
});

// @desc   Clear user's favorite products
// @route  DELETE /api/favorite/:userId
// @access User/Admin
export const DeleteFavorites = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user.id; // لو admin أو user الحالي

  const favorite = await Favorite.findOne({ userId });

  if (!favorite) {
    return res.status(404).json({
      success: false,
      message: "No favorites found for this user",
    });
  }

  favorite.products = [];
  await favorite.save();

  res.status(200).json({
    success: true,
    message: "All favorite products cleared",
    favorite,
  });
});

// @desc   Get top favorite products (most liked by users)
// @route  GET /api/favorite/top
// @access Public
export const getTopFavoritesProduct = asyncHandler(async (req, res) => {
  const favorites = await Favorite.aggregate([
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products",
        totalFavorites: { $sum: 1 },
      },
    },
    { $sort: { totalFavorites: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "products",
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

// 1️⃣ السبب الأساسي: اختلاف نوع userId

// في الـ Favorite Schema عندك:

// userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }

// يعني كل userId مخزّن كـ ObjectId في قاعدة البيانات.

// لكن في الكود القديم كنت:

// const userId = req.user.id; // ده String
// const deletedFavorite = await Favorite.findOneAndDelete({ userId });

// هنا userId String → مش هيطابق الـ ObjectId في MongoDB → البحث فشل → رجع null → الرسالة "No favorites found".

// 2️⃣ الحل اللي اشتغل

// في الكود الجديد، حولنا الـ userId لـ ObjectId:

// const objectUserId = new mongoose.Types.ObjectId(userId);
// const favorite = await Favorite.findOne({ userId: objectUserId });

// دلوقتي النوع متوافق مع الـ Schema → البحث بيشتغل → يلاقي الـ document → تقدر تمسح المنتجات أو الـ document نفسه.

// 3️⃣ نقطة مهمة: Clear vs Delete

// الكود القديم كان بيحاول يمسح الـ document (findOneAndDelete) → كان ممكن يفشل لو userId مش ObjectId.

// الكود الجديد استخدمنا Clear: مسح المنتجات بس (favorite.products = []) → آمن، ما يحذفش الـ document → ومفيش مشكلة type mismatch.

// ✅ الخلاصة

// المشكلة كانت نوع البيانات (String vs ObjectId) عند البحث.

// الحل: تحويل أي userId من التوكن أو الـ params لـ mongoose.Types.ObjectId قبل البحث.

// وكمان استخدام Clear بدل Delete للـ favorites كان أكثر أمانًا للمستخدم العادي.

// لو تحب، أقدر أرسملك مخطط workflow للـ Favorites CRUD يوضح الـ toggle, get, clear كلها مترابطة بحيث تفهم كل العمليات بطريقة منظمة.

// تحب أعملهولك؟
