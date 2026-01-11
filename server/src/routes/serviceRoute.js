const express = require("express");
const router = express.Router();

const {
  createService,
  updateService,
  deleteService,
  getAllServices,
  getServiceById,
  selectProviderServices,
} = require("../controllers/serviceController");

const authentication = require("../middlewares/authMiddleware");
const authorization = require("../middlewares/authorization");

router.post(
  "/admin/service",
  authentication,
  authorization("admin"),
  createService
);

router.put(
  "/admin/update-service/:id",
  authentication,
  authorization("admin"),
  updateService
);

router.delete(
  "/admin/delete-service/:id",
  authentication,
  authorization("admin"),
  deleteService
);

router.get("/getAllServices", getAllServices);

router.get("/getService/:id", getServiceById);

// Provider Route
router.put(
  "/provider/add-services",
  authentication,
  authorization("provider"),
  selectProviderServices
);

module.exports = router;
