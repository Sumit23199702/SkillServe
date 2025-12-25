const mongoose = require("mongoose");
const categoryModel = require("../models/categoryModel");
const { isValid, isValidName } = require("../utils/validator");

// Create Category (Admin)
const createCategory = async (req, res) => {
  try {
    let categoryData = req.body;

    // Validation
    if (!categoryData || Object.keys(categoryData).length === 0) {
      return res.status(400).json({ msg: "Bad Request ! No Data Provided." });
    }

    let { name } = categoryData;

    // Name Validation
    if (!isValid(name)) {
      return res.status(400).json({ msg: "Category Name is Required" });
    }

    if (!isValidName(name)) {
      return res.status(400).json({ msg: "Invalid Category" });
    }

    let existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ msg: "Category Already Exists" });
    }

    let categoryCreated = await categoryModel.create(categoryData);
    return res
      .status(201)
      .json({ msg: "Category Created Successfully", categoryCreated });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Update Category (Admin)
const updateCategory = async (req, res) => {
  try {
    let categoryId = req.params.id;
    let data = req.body;

    // Validation
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ msg: "Invalid Category Id" });
    }

    if (!data || Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ msg: "Bad Request ! No Data Provided to Update." });
    }

    let { name, description } = data;
    let updatedData = {};

    // Name Update
    if (isValid(name)) {
      if (!isValidName(name)) {
        return res.status(400).json({ msg: "Invalid Category" });
      }

      let existingCategory = await categoryModel.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ msg: "Category Already Exists" });
      }

      updatedData.name = name;
    }

    // Description Update
    if (isValid(description)) {
      updatedData.description = description;
    }

    let updatedCategory = await categoryModel.findByIdAndUpdate(
      categoryId,
      updatedData,
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ msg: "Category Not Found" });
    }

    return res
      .status(200)
      .json({ msg: "Category Updated Successfully", updatedCategory });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Delete Category (Admin)
const deleteCategory = async (req, res) => {
  try {
    let categoryId = req.params.id;

    // Validation
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ msg: "Invalid Category Id" });
    }

    let deleted = await categoryModel.findByIdAndDelete(categoryId);
    if (!deleted) {
      return res.status(404).json({ msg: "Category Not Found" });
    }

    return res.status(200).json({ msg: "Category Deleted Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Get All Category
const getAllCategories = async (req, res) => {
  try {
    let categories = await categoryModel.find().sort({ createdAt: -1 });

    if (categories.length === 0) {
      return res.status(404).json({ msg: "No categories Found" });
    }

    return res.status(200).json({ categories });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Get Category By Id
const getCategoryById = async (req, res) => {
  try {
    let categoryId = req.params.id;

    // Validation
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ msg: "Invalid Category Id" });
    }

    let category = await categoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ msg: "Category Not Found" });
    }

    return res.status(200).json({ category });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
};
