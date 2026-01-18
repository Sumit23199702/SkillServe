const mongoose = require("mongoose");
const bookingModel = require("../models/bookingModel");
const providerModel = require("../models/providerModel");
const serviceModel = require("../models/serviceModel");
const { isValid } = require("../utils/validator");

// Create Booking (User)
const createBooking = async (req, res) => {
  try {
    const userId = req.userId;

    let { providerId, services, bookingDate } = req.body;

    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ msg: "At least One service is required" });
    }

    for (let serviceId of services) {
      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ msg: "Invalid Service Id" });
      }
    }

    if (!isValid(bookingDate)) {
      return res.status(400).json({ msg: "Booking Date is Required" });
    }

    const provider = await providerModel.findById(providerId);
    if (!provider) {
      return res.status(404).json({ msg: "Provider Not Found" });
    }

    if (!provider.isApproved) {
      return res.status(403).json({ msg: "Provider is Not Approved" });
    }

    const serviceDocs = await serviceModel.find({
      _id: { $in: services },
      isActive: true,
    });

    if (serviceDocs.length !== services.length) {
      return res
        .status(400)
        .json({ msg: "One or More Service are Invalid or Inactive" });
    }

    let totalPrice = 0;

    serviceDocs.forEach((s) => {
      totalPrice += s.price;
    });

    const bookingCreated = await bookingModel.create({
      user: userId,
      provider: providerId,
      services,
      totalPrice,
      bookingDate,
    });

    return res
      .status(201)
      .json({ msg: "Booking Created Successfully", bookingCreated });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Get My Bookings (User)
const getMyBookings = async (req, res) => {
  try {
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid User Id" });
    }

    const bookings = await bookingModel
      .find({ user: userId })
      .populate("provider", "profession experience")
      .populate("services")
      .sort({ createdAt: -1 });

    if (bookings.length === 0) {
      return res.status(404).json({ msg: "No bookings found" });
    }

    return res.status(200).json({
      msg: "Bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Get Provider Bookings (Provider)
const getProviderBookings = async (req, res) => {
  try {
    const userId = req.userId;

    const provider = await providerModel.findOne({ user: userId });
    if (!provider) {
      return res.status(404).json({ msg: "Provider profile not found" });
    }

    const bookings = await bookingModel
      .find({ provider: provider._id })
      .populate("user", "name email phone")
      .populate("services")
      .sort({ createdAt: -1 });

    if (bookings.length === 0) {
      return res.status(404).json({ msg: "No bookings found" });
    }

    return res.status(200).json({
      msg: "Provider bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Update Booking Status (Provider)
const updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const { status } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ msg: "Invalid Booking Id" });
    }

    if (
      ![
        "Requested",
        "Accepted",
        "In Progress",
        "Completed",
        "Cancelled",
      ].includes(status)
    ) {
      return res.status(400).json({ msg: "Invalid booking status" });
    }

    const provider = await providerModel.findOne({ user: userId });
    if (!provider) {
      return res.status(403).json({ msg: "Only provider can update booking" });
    }

    const booking = await bookingModel.findOne({
      _id: bookingId,
      provider: provider._id,
    });

    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    return res.status(200).json({
      msg: "Booking status updated successfully",
      data: booking,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
};
