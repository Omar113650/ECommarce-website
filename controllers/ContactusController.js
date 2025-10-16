import asyncHandler from "express-async-handler";
import { ContactUS } from "../models/Contactus.js";

// @desc    Create new contact message
// @route   POST /api/contact
// @access  Public
export const createContact = asyncHandler(async (req, res) => {
  const { Name, Phone, Email, Message } = req.body;
  const contact = await ContactUS.create({
    Name,
    Phone,
    Email,
    Message,
  });
  res.status(201).json({
    success: true,
    message: "Your message has been received successfully",
    data: contact,
  });
});

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private (Admin)
export const getAllContacts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const contacts = await ContactUS.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await ContactUS.countDocuments();
  if (!contacts || contacts.length === 0) {
    return res.status(404).json({ message: "No contact messages found" });
  }

  res.status(200).json({
    success: true,
    page,
    totalPages: Math.ceil(total / limit),
    count: contacts.length,
    data: contacts,
  });
});

// @desc    Get single contact message by ID
// @route   GET /api/contact/:id
// @access  Private (Admin)
export const getContactById = asyncHandler(async (req, res) => {
  const contact = await ContactUS.findById(req.params.id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: "Contact message not found",
    });
  }

  res.status(200).json({
    success: true,
    data: contact,
  });
});

// @desc    Update contact message (if needed)
// @route   PUT /api/contact/:id
// @access  Private (Admin)
export const updateContact = asyncHandler(async (req, res) => {
  let contact = await ContactUS.findById(req.params.id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: "Contact message not found",
    });
  }

  contact = await ContactUS.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Contact updated successfully",
    data: contact,
  });
});

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private (Admin)
export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await ContactUS.findByIdAndDelete(req.params.id);
  if (!contact) {
    return res.status(404).json({
      success: false,
      message: "Contact message not found",
    });
  }
  res.status(200).json({
    success: true,
    message: "Contact deleted successfully",
  });
});

