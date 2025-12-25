const express = require("express");
const router = express.Router();

const {
  applyAsProvider,
  getMyProviderProfile,
} = require("../controllers/providerController");

const authentication = require("../middlewares/authMiddleware");

router.post("/provider/apply", authentication, applyAsProvider);
router.get("/provider/myProfile", authentication, getMyProviderProfile);

module.exports = router;
