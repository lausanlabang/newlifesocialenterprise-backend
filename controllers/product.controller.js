const Product = require("../models/product.model");
const User = require("../models/user.model");
const slugify = require("slugify");

exports.create = async (req, res) => {
  try {
    console.log(req.body);
    req.body.slug = slugify(req.body.title);
    const newProduct = await new Product(req.body).save();
    res.json(newProduct);
  } catch (error) {
    console.log(error);
    // res.status(400).send("Create product failed");
    res.status(400).json({ err: error.message });
  }
};

exports.listAll = async (req, res) => {
  let products = await Product.find({})
    .limit(parseInt(req.params.count))
    .populate("category")
    .populate("subs")
    .sort([["createdAt", "desc"]])
    .exec();
  res.json(products);
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndRemove({
      _id: req.params.productId,
    }).exec();
    res.json(deleted);
  } catch (error) {
    console.log(error);
    res.status(400).send("Product delete failed");
  }
};

exports.read = async (req, res) => {
  const product = await Product.findById({ _id: req.params.productId })
    .populate("category")
    .populate("subs")
    .exec();
  res.json(product);
};

exports.update = async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updated = await Product.findByIdAndUpdate(
      { _id: req.params.productId },
      req.body,
      { new: true }
    ).exec();
    res.json(updated);
  } catch (error) {
    console.log("PRODUCT UPDATE ERROR", error);
    //return res.status(400).send("Product update failed");
    res.status(400).json({ err: error.message });
  }
};

// exports.list = async (req, res) => {
//   try {
//     const { sort, order, limit } = req.body;
//     const products = await Product.find({})
//       .populate("category")
//       .populate("subs")
//       .sort([[sort, order]])
//       .limit(limit)
//       .exec();

//     res.json(products);
//   } catch (error) {
//     console.log(error);
//   }
// };

exports.list = async (req, res) => {
  //console.table(req.body);
  try {
    const { sort, order, page } = req.body;
    const currentPage = page || 1;
    const perPage = 6;

    const products = await Product.find({})
      .skip((currentPage - 1) * perPage)
      .populate("category")
      .populate("subs")
      .sort([[sort, order]])
      .limit(perPage)
      .exec();

    res.json(products);
  } catch (error) {
    console.log(error);
  }
};

exports.listBestSellers = async (req, res) => {
  //console.table(req.body);
  try {
    const { sort, order, page } = req.body;
    const currentPage = page || 1;
    const perPage = 3;

    const products = await Product.find({
      sold: { $gt: 0 },
    })
      .skip((currentPage - 1) * perPage)
      .populate("category")
      .populate("subs")
      .sort([[sort, order]])
      .limit(perPage)
      .exec();

    res.json(products);
  } catch (error) {
    console.log(error);
  }
};

exports.productsCount = async (req, res) => {
  let total = await Product.find({}).estimatedDocumentCount().exec();
  res.json(total);
};

exports.apiProductStar = async (req, res) => {
  const product = await Product.findById(req.params.productId).exec();
  const user = await User.findOne({ email: req.user.email }).exec();
  const { star } = req.body;

  // who is updating?
  // check if currently logged in user have already added rating to this product?
  let existingRatingObject = product.ratings.find(
    (ele) => ele.postedBy.toString() === user._id.toString()
  );

  // if user haven't left rating yet, push it
  if (existingRatingObject === undefined) {
    let ratingAdded = await Product.findByIdAndUpdate(
      product._id,
      {
        $push: { ratings: { star, postedBy: user._id } },
      },
      { new: true }
    ).exec();
    console.log("ratingAdded", ratingAdded);
    res.json(ratingAdded);
  } else {
    // if user have already left rating, update it
    const ratingUpdated = await Product.updateOne(
      {
        ratings: { $elemMatch: existingRatingObject },
      },
      { $set: { "ratings.$.star": star } },
      { new: true }
    ).exec();
    console.log("ratingUpdated", ratingUpdated);
    res.json(ratingUpdated);
  }
};

exports.listRelated = async (req, res) => {
  const product = await Product.findById({ _id: req.params.productId }).exec();

  if (!product) {
    return res.status(404).send("Product not found");
  }

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
  })
    .limit(3)
    .populate("category")
    .populate("subs")
    .populate("ratings.postedBy")
    .exec();

  res.json(related);
};

// const handleQuery = async (req, res, query) => {
//   const keywords = query.split(' ').map((word) => word.trim()).filter(Boolean);
//   const products = await Product.find({
//     $or: [
//       { title: { $regex: query, $options: "i" } },
//       { description: { $regex: query, $options: "i" } },
//     ],
//   })
//     .populate("category", "_id name")
//     .populate("subs", "_id name")
//     .populate("ratings.postedBy", "_id name")
//     .exec();

//   res.json(products);
// };

// const handleQuery = async (req, res, query) => {
//   const keywords = query
//     .split(" ")
//     .map((word) => word.trim())
//     .filter(Boolean);
//   const products = await Product.find({
//     $or: keywords.map((keyword) => ({
//       $or: [
//         { title: { $regex: keyword, $options: "i" } },
//         { description: { $regex: keyword, $options: "i" } },
//       ],
//     })),
//   })
//     .populate("category", "_id name")
//     .populate("subs", "_id name")
//     .populate("ratings.postedBy", "_id name")
//     .exec();

//   res.json(products);
// };

const handleQuery = async (req, res, query) => {
  const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
  try {
    const products = await Product.find({
      $or: [
        { title: { $regex: keywords.join("|"), $options: "i" } },
        { description: { $regex: keywords.join("|"), $options: "i" } },
      ],
    })
      .populate("category", "_id name")
      .populate("subs", "_id name")
      .populate("ratings.postedBy", "_id name")
      .exec();
    const sortedProducts = products
      .map((product) => {
        const titleMatches = keywords.filter((keyword) =>
          product.title.toLowerCase().includes(keyword)
        ).length;
        const descriptionMatches = keywords.filter((keyword) =>
          product.description.toLowerCase().includes(keyword)
        ).length;
        const totalMatches = titleMatches + descriptionMatches;
        const matchesInTitle = titleMatches;
        const matchesInDescription = descriptionMatches;

        return {
          ...product.toObject(),
          totalMatches,
          matchesInTitle,
          matchesInDescription,
        };
      })
      .sort((a, b) => b.totalMatches - a.totalMatches);

    res.json(sortedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const handlePriceRange = async (req, res, price) => {
  try {
    let products = await Product.find({
      price: {
        $gte: price[0],
        $lte: price[1],
      },
    })
      .populate("category", "_id name")
      .populate("subs", "_id name")
      .populate("ratings.postedBy", "_id name")
      .exec();

    res.json(products);
  } catch (error) {
    console.log(error);
  }
};

const handleCategory = async (req, res, category) => {
  try {
    let products = await Product.find({
      category,
    })
      .populate("category", "_id name")
      .populate("subs", "_id name")
      .populate("ratings.postedBy", "_id name")
      .exec();

    res.json(products);
  } catch (erroe) {
    console.log(error);
  }
};

const handleStars = (req, res, stars) => {
  Product.aggregate([
    {
      $project: {
        document: "$$ROOT",
        floorAverage: {
          $floor: { $avg: "$ratings.star" },
        },
      },
    },
    {
      $match: { floorAverage: stars },
    },
  ])
    .limit(12)
    .exec((err, products) => {
      if (err) console.log("AGGREGATION ERROR", err);

      Product.find({ _id: products })
        .populate("category", "_id name")
        .populate("subs", "_id name")
        .populate("ratings.postedBy", "_id name")
        .exec((err, products) => {
          if (err) console.log("PRODUCT ERROR", err);
          res.json(products);
        });
    });
};

const handleSub = async (req, res, sub) => {
  try {
    let products = await Product.find({
      subs: sub,
    })
      .populate("category", "_id name")
      .populate("subs", "_id name")
      .populate("ratings.postedBy", "_id name")
      .exec();

    res.json(products);
  } catch (error) {
    console.log(error);
  }
};

const handleShipping = async (req, res, shipping) => {
  const products = await Product.find({ shipping })
    .populate("category", "_id name")
    .populate("subs", "_id name")
    .populate("ratings.postedBy", "_id name")
    .exec();

  res.json(products);
};

const handleColor = async (req, res, color) => {
  const products = await Product.find({ color })
    .populate("category", "_id name")
    .populate("subs", "_id name")
    .populate("ratings.postedBy", "_id name")
    .exec();

  res.json(products);
};

const handleBrand = async (req, res, brand) => {
  const products = await Product.find({ brand })
    .populate("category", "_id name")
    .populate("subs", "_id name")
    .populate("ratings.postedBy", "_id name")
    .exec();

  res.json(products);
};

exports.searchFilters = async (req, res) => {
  const { query, price, category, stars, sub, shipping, color, brand } =
    req.body;

  if (query) {
    await handleQuery(req, res, query);
  }

  // price range [20, 200]
  if (price !== undefined) {
    console.log("price", price);
    await handlePriceRange(req, res, price);
  }

  if (category) {
    console.log("category", category);
    await handleCategory(req, res, category);
  }

  if (stars) {
    console.log("stars", stars);
    await handleStars(req, res, stars);
  }

  if (sub) {
    console.log("sub", sub);
    await handleSub(req, res, sub);
  }

  if (shipping) {
    console.log("shipping", shipping);
    await handleShipping(req, res, shipping);
  }

  if (color) {
    console.log("color", color);
    await handleColor(req, res, color);
  }

  if (brand) {
    console.log("brand", brand);
    await handleBrand(req, res, brand);
  }
};
