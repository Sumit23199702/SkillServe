const express = require("express");
const router = express.Router();

const {
  applyAsProvider,
  getMyProviderProfile,
  updateProviderProfile,
  approveProvider,
} = require("../controllers/providerController");

const authentication = require("../middlewares/authMiddleware");
const authorization = require("../middlewares/authorization");

router.post("/provider/apply", authentication, applyAsProvider);
router.get("/provider/myProfile", authentication, getMyProviderProfile);
router.put("/provider/update", authentication, updateProviderProfile);

router.put(
  "/provider/verification/:providerId",
  authentication,
  authorization("admin"),
  approveProvider
);

module.exports = router;
