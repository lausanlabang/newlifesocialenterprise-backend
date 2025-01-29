const Sub = require("../models/sub.model");
const slugify = require("slugify");
const Product = require("../models/product.model");

exports.create = async (req, res) => {
  try {
    const { name, parent } = req.body;
    const sub = await new Sub({ name, parent, slug: slugify(name) }).save();
    res.json(sub);
  } catch (error) {
    console.log(error);
    res.status(400).send("Create sub failed");
  }
};

exports.list = async (req, res) => {
  res.json(
    await Sub.find({}).sort({ createdAt: -1 }).populate("parent").exec()
  );
};

exports.read = async (req, res) => {
  let sub = await Sub.findOne({ slug: req.params.slug })
    .populate("parent")
    .exec();
  const products = await Product.find({ subs: sub._id })
    .populate("category")
    .populate("subs")
    .populate("ratings.postedBy")
    .exec();
  res.json({ sub, products });
};

exports.productsBySub = async (req, res) => {
  let sub = await Sub.findOne({ slug: req.params.slug })
    .populate("parent")
    .exec();
  try {
    const { sort, order, page } = req.body;
    const currentPage = page || 1;
    const perPage = 3;

    const products = await Product.find({ subs: sub._id })
      .skip((currentPage - 1) * perPage)
      .populate("category")
      .populate("subs")
      .sort([[sort, order]])
      .limit(perPage)
      .exec();

    res.json({ sub, products });
  } catch (error) {
    console.log(error);
  }
};

exports.update = async (req, res) => {
  const { name, parent } = req.body;
  try {
    const updated = await Sub.findOneAndUpdate(
      { slug: req.params.slug },
      { name, parent, slug: slugify(name) },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    console.log(error);
    res.status(400).send("Sub update failed");
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Sub.findOneAndDelete({ slug: req.params.slug });
    res.json(deleted);
  } catch (error) {
    res.status(400).send("Sub delete failed");
  }
};
