const express = require("express");
const router = express.Router();

//middlewares
const { authCheck, adminCheck } = require("../middlewares/auth.middleware");

//controller
const {
  create,
  read,
  update,
  remove,
  list,
  getSubs,
  productsByCategory,
} = require("../controllers/category.controller");

//routes
router.post("/category", authCheck, adminCheck, create);
router.get("/category/:slug", read);
router.get("/categories", list);
router.put("/category/:slug", authCheck, adminCheck, update);
router.delete("/category/:slug", authCheck, adminCheck, remove);
router.get("/category/subs/:_id", getSubs);
router.post("/category/pagination/:slug", productsByCategory);

module.exports = router;
