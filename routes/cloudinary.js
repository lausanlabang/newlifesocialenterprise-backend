const express = require("express");
const router = express.Router();

const { authCheck, adminCheck } = require("../middlewares/auth.middleware");

const { upload, remove } = require("../controllers/cloudinary.controller");

router.post("/uploadimages", authCheck, adminCheck, upload);
router.post("/removeimage", authCheck, adminCheck, remove);

module.exports = router;
