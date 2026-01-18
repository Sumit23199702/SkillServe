const express = require("express");
const router = express.Router();

const authentication = require("../middlewares/authMiddleware");
const authorization = require("../middlewares/authorization");

const {
  createBooking,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");

router.post("/booking/create", authentication, createBooking);
router.get("/booking/getMyBookings", authentication, getMyBookings);

router.get(
  "/booking/getProviderBookings",
  authentication,
  authorization("provider"),
  getProviderBookings,
);

router.put(
  "/booking/update/:bookingId",
  authentication,
  authorization("provider"),
  updateBookingStatus,
);

module.exports = router;
