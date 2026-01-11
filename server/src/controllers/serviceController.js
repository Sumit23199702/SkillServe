const mongoose = require("mongoose");
const serviceModel = require("../models/serviceModel");
const categoryModel = require("../models/categoryModel");
const providerModel = require("../models/providerModel");
const { isValid } = require("../utils/validator");

// Create Service (Admin)
const createService = async (req, res) => {
  try {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ msg: "Bad Request ! No Data Provided." });
    }

    const { title, description, price, category, duration } = data;

    if (!isValid(title)) {
      return res.status(400).json({ msg: "Title is required" });
    }

    if (!isValid(price) || price < 0) {
      return res.status(400).json({ msg: "Valid Price is Required" });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ msg: "Invalid Category Id" });
    }

    const categoryExists = await categoryModel.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ msg: "Category Not Found" });
    }

    if (!isValid(duration) || duration < 15) {
      return res.status(400).json({ msg: "Invalid Duration" });
    }

    const services = await serviceModel.create({
      title,
      description,
      price,
      category,
      duration,
    });

    return res
      .status(201)
      .json({ msg: "Service Created Successfully", services });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Update Service(Admin)
const updateService = async (req, res) => {
  try {
    let serviceId = req.params.id;
    let data = req.body;

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ msg: "Invalid Service Id" });
    }

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ msg: "Bad Request ! No Data Provided." });
    }

    let { title, description, price, category, duration, isActive } = data;

    let updatedData = {};

    if (isValid(title)) {
      updatedData.title = title;
    }

    if (isValid(description)) {
      updatedData.description = description;
    }

    if (isValid(price) && price > 0) {
      updatedData.price = price;
    }

    if (isValid(duration) && duration >= 15) {
      updatedData.duration = duration;
    }

    if (isValid(category)) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ msg: "Invalid Category Id" });
      }

      const categoryExists = await categoryModel.findById(category);
      if (!categoryExists) {
        return res.status(404).json({ msg: "Category Not Found" });
      }

      updatedData.category = category;
    }

    if (isActive && typeof isActive === "boolean") {
      updatedData.isActive = !isActive;
    }

    const serviceUpdated = await serviceModel.findByIdAndUpdate(
      serviceId,
      updatedData,
      { new: true }
    );

    if (!serviceUpdated) {
      return res.status(404).json({ msg: "Service Not Found" });
    }

    return res
      .status(200)
      .json({ msg: "Service Updated Successfully", serviceUpdated });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Delete Service (Admin)
const deleteService = async (req, res) => {
  try {
    let serviceId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ msg: "Invalid Service Id" });
    }

    const deleted = await serviceModel.findByIdAndDelete(serviceId);

    if (!deleted) {
      return res.status(404).json({ msg: "Service Not Found" });
    }

    return res.status(200).json({ msg: "Service Deleted Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Get All Service
const getAllServices = async (req, res) => {
  try {
    const services = await serviceModel
      .find()
      .populate("category", "name")
      .sort({ createdAt: -1 });

    if (!services || services.length === 0) {
      return res.status(404).json({ msg: "No Services Found" });
    }

    return res.status(200).json({ services });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Get Service By Id
const getServiceById = async (req, res) => {
  try {
    let serviceId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ msg: "Invalid Service Id" });
    }

    const service = await serviceModel
      .findById(serviceId)
      .populate("category", "name");

    if (!service) {
      return res.status(404).json({ msg: "Service Not Found" });
    }

    return res.status(200).json({ service });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Add Services To Provider
const selectProviderServices = async (req, res) => {
  try {
    let userId = req.userId;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ msg: "Bad Request ! No Data Provided." });
    }
    const { servicesOffered } = req.body;

    if (!Array.isArray(servicesOffered) || servicesOffered.length === 0) {
      return res.status(400).json({
        msg: "Services Offered Must be an array with atleast one service",
      });
    }

    const provider = await providerModel.findOne({ user: userId });

    if (!provider) {
      return res.status(404).json({ msg: "Provider Not Found" });
    }

    if (!provider.isApproved) {
      return res.status(403).json({ msg: "Provider Not Approved Yet." });
    }

    for (let serviceId of servicesOffered) {
      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ msg: "Invalid Service Id" });
      }
      const serviceExists = await serviceModel.findById(serviceId);
      if (!serviceExists) {
        return res.status(404).json({ msg: `Service Not found: ${serviceId}` });
      }
    }

    provider.servicesOffered = servicesOffered;
    await provider.save();

    return res
      .status(200)
      .json({ msg: "Services Selected Successfully", provider });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

module.exports = {
  createService,
  updateService,
  deleteService,
  getAllServices,
  getServiceById,
  selectProviderServices,
};
