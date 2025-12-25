const mongoose = require("mongoose");
const providerModel = require("../models/providerModel");
const userModel = require("../models/userModel");

const { isValid } = require("../utils/validator");

// Apply As Provider
const applyAsProvider = async (req, res) => {
  try {
    let userId = req.userId;
    let data = req.body;

    if (!userId) {
      return res.status(400).json({ msg: "User Id is Required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid User Id" });
    }

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ msg: "Bad Request ! No Data Provided." });
    }

    let { profession, experience, servicesOffered, availableSlots } = data;

    let user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }

    if (user.role === "provider") {
      return res
        .status(400)
        .json({ msg: "User is Already registered as provider" });
    }

    let existingProvider = await providerModel.findOne({ user: userId });

    if (existingProvider) {
      return res
        .status(400)
        .json({ msg: "Provider Application Already Submitted" });
    }

    if (!isValid(profession)) {
      return res.status(400).json({ msg: "Profession is Required" });
    }

    if (!isValid(experience)) {
      return res.status(400).json({ msg: "Experience is Required" });
    }

    if (typeof experience !== "number" || experience < 0) {
      return res.status(400).json({ msg: "Invalid Experience" });
    }

    if (!isValid(servicesOffered)) {
      return res.status(400).json({ msg: "Services Offered is Required" });
    }

    if (!Array.isArray(servicesOffered) || servicesOffered.length === 0) {
      return res
        .status(400)
        .json({ msg: "At least One Service must be selected" });
    }

    for (let serviceId of servicesOffered) {
      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ msg: "Invalid Service Id" });
      }
    }

    if (isValid(availableSlots)) {
      if (!Array.isArray(availableSlots) || availableSlots.length === 0) {
        return res
          .status(400)
          .json({ msg: "Available Slots must be an array" });
      }

      for (let slot of availableSlots) {
        if (!slot.date || !slot.time) {
          return res
            .status(400)
            .json({ msg: "Each Slot must contain date and time" });
        }
      }
    }

    let providerCreated = await providerModel.create(data);

    return res.status(201).json({
      msg: "Provider Application Submitted Successfully",
      providerCreated,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Get My Provider Profile
const getMyProviderProfile = async (req, res) => {
  try {
    let userId = req.userId;

    if (!userId) {
      return res.status(400).json({ msg: "User Id is Required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid User Id" });
    }

    let user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }

    if (user.role !== "provider") {
      return res
        .status(403)
        .json({ msg: "Access Denied !!! User is not a Provider" });
    }

    let provider = await providerModel.findOne({ user: userId });

    if (!provider) {
      return res.status(404).json({ msg: "Provider Profile Not Found" });
    }

    return res.status(200).json({ provider });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

module.exports = { applyAsProvider, getMyProviderProfile };
