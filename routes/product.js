const express = require("express");
const router = express.Router();

//middlewares
const { authCheck, adminCheck } = require("../middlewares/auth.middleware");

//controller
const {
  create,
  listAll,
  remove,
  read,
  update,
  list,
  productsCount,
  listBestSellers,
  apiProductStar,
  listRelated,
  searchFilters,
} = require("../controllers/product.controller");

//routes

router.post("/product", authCheck, adminCheck, create);
router.get("/products/total", productsCount);

router.get("/products/:count", listAll);
router.delete("/product/:productId", authCheck, adminCheck, remove);
router.get("/product/:slug/:productId", read);
router.put("/product/:slug/:productId", authCheck, adminCheck, update);

router.post("/products", list); //using post for request data is for sending along with the parameter
router.post("/products/best-sellers", listBestSellers);

router.post("/product/starRating/:productId", authCheck, apiProductStar);
//related products
router.get("/product/related-products/:slug/:productId", listRelated);
//serach query
router.post("/search/filters", searchFilters);

module.exports = router;
