const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      text: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
      text: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
    },
    category: {
      type: ObjectId,
      ref: "Category",
    },
    subs: [
      {
        type: ObjectId,
        ref: "Sub",
      },
    ],
    quantity: Number,
    sold: {
      type: Number,
      default: 0,
    },
    images: {
      type: Array,
    },
    shipping: { type: String, enum: ["Yes", "No"] },
    color: {
      type: String,
      enum: ["Black", "Brown", "Silver", "White", "Blue", "no color"],
    },
    brand: {
      type: String,
      enum: [
        "Apple",
        "Samsung",
        "Microsoft",
        "Lenovo",
        "ASUS",
        "oneplus",
        "no brand",
      ],
    },
    ratings: [
      {
        star: Number,
        postedBy: { type: ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text" }); //Schema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model("Product", productSchema);
