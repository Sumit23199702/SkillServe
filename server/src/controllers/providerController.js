const mongoose = require("mongoose");
const providerModel = require("../models/providerModel");
const userModel = require("../models/userModel");
const serviceModel = require("../models/serviceModel");

const { isValid } = require("../utils/validator");

// Apply As Provider (User)
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

    let {
      profession,
      experience,
      bio,
      location,
      servicesOffered,
      availableSlots,
    } = data;

    let user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
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

    let providerCreated = await providerModel.create({
      user: userId,
      profession,
      experience,
      bio,
      location,
      servicesOffered,
      availableSlots,
    });

    return res.status(201).json({
      msg: "Provider Application Submitted Successfully",
      providerCreated,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Get My Provider Profile (Provider)
const getMyProviderProfile = async (req, res) => {
  try {
    let userId = req.userId;
    if (!userId) {
      return res.status(400).json({ msg: "User Id is Required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid User Id" });
    }

    let provider = await providerModel.findOne({ user: userId });
    console.log(provider);

    if (!provider) {
      return res.status(404).json({ msg: "Provider Profile Not Found" });
    }

    return res.status(200).json({ provider });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Update Provider Profile (Provider)
const updateProviderProfile = async (req, res) => {
  try {
    let userId = req.userId;
    const data = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid User Id" });
    }

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ msg: "Bad Request ! No Data Provided." });
    }

    const provider = await providerModel.findOne({ user: userId });
    if (!provider) {
      return res.status(404).json({ msg: "Provider Profile Not Found" });
    }

    let { profession, experience, bio, location, availableSlots } = data;
    let updatedData = {};

    if (isValid(profession)) {
      updatedData.profession = profession;
    }

    if (isValid(experience)) {
      if (typeof experience !== "number" || experience < 0) {
        return res.status(400).json({ msg: "Invalid Experience" });
      }
      updatedData.experience = experience;
    }

    if (isValid(bio)) {
      updatedData.bio = bio;
    }

    if (isValid(location)) {
      updatedData.location = location;
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

    const updateProvider = await providerModel.findOneAndUpdate(
      {
        user: userId,
      },
      updatedData,
      { new: true }
    );

    return res
      .status(200)
      .json({ msg: "Provider Profile Updated Successfully", updateProvider });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Approve / Reject Provider (Admin)
const approveProvider = async (req, res) => {
  try {
    const providerId = req.params.providerId;
    const { action } = req.body;

    if (!(req.body) || Object.keys(req.body).length === 0) {
      return res.status(400).json({ msg: "Bad Request ! No Data Provided." });
    }

    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({ msg: "Invalid Provider Id" });
    }

    if (!["approve", "reject"].includes(action)) {
      return res
        .status(400)
        .json({ msg: "Action Must be either 'Approve' or 'Reject'." });
    }

    let provider = await providerModel.findById(providerId).populate("user");

    if (!provider) {
      return res.status(404).json({ msg: "Provider Not Found" });
    }

    if (action === "approve") {
      provider.isApproved = true;
      provider.verificationStatus = "approved";
      provider.user.role = "provider";
    } else {
      provider.isApproved = false;
      provider.verificationStatus = "rejected";
      provider.user.role = "user";
    }

    await provider.save();
    await provider.user.save();

    return res.status(200).json({
      msg: `Provider ${action === "approve" ? "Approved" : "Rejected"}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};



module.exports = {
  applyAsProvider,
  getMyProviderProfile,
  updateProviderProfile,
  approveProvider,
};
