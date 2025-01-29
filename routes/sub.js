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
  productsBySub,
} = require("../controllers/sub.controller");

//routes
router.post("/sub", authCheck, adminCheck, create);
router.get("/sub/:slug", read);
router.get("/subs", list);
router.put("/sub/:slug", authCheck, adminCheck, update);
router.delete("/sub/:slug", authCheck, adminCheck, remove);
router.post("/products/sub/:slug", productsBySub);

module.exports = router;
