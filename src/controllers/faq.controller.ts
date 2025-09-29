import { Faq } from "../models/faq.model";
import catchAsync from "../utils/catchAsync";

// Create FAQ
const createFaq = catchAsync(async (req, res) => {
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({
      success: false,
      message: "Question and Answer are required",
    });
  }

  const savedFaq = await Faq.create({ question, answer });

  res.status(200).json({
    success: true,
    message: "Faq created successfully",
    data: savedFaq,
  });
});

// Edite FAQ
const editFaq = catchAsync(async (req, res) => {
  const { faqId } = req.params;
  const { question, answer } = req.body;

  const updatedFaq = await Faq.findByIdAndUpdate(
    faqId,
    { question, answer },
    { new: true }
  );

  if (!updatedFaq) {
    return res.status(404).json({
      success: false,
      message: "Faq not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Faq updated successfully",
    data: updatedFaq,
  });
});

// Delete FAQ
const deleteFaq = catchAsync(async (req, res) => {
  const { faqId } = req.params;

  const deletedFaq = await Faq.findByIdAndDelete(faqId);

  if (!deletedFaq) {
    return res.status(404).json({
      success: false,
      message: "Faq not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Faq deleted successfully",
  });
});

// Get All FAQs
const getAllFaqs = catchAsync(async (req, res) => {
  const { page } = req.query;

  // Validate page input
  if (page !== "home" && page !== "faq") {
    return res.status(400).json({
      success: false,
      message: "Invalid page type. Must be 'home' or 'faq'.",
    });
  }

  // Map page to schema field
  const filter = page === "home" ? { home: true } : { faq: true };

  const faqs = await Faq.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: faqs,
  });
});

const updateFaqHomePage = catchAsync(async (req, res) => {
  const { faqId } = req.params;

  // Fetch the FAQ first
  const faq = await Faq.findById(faqId);

  if (!faq) {
    return res.status(404).json({
      success: false,
      message: "Faq not found",
    });
  }

  // Toggle the boolean value
  faq.home = !faq.home;
  const updatedFaq = await faq.save();

  res.status(200).json({
    success: true,
    message: "Faq updated successfully",
    data: updatedFaq,
  });
});

const updateFaqFaqPage = catchAsync(async (req, res) => {
  const { faqId } = req.params;

  // Fetch the FAQ first
  const faq = await Faq.findById(faqId);

  if (!faq) {
    return res.status(404).json({
      success: false,
      message: "Faq not found",
    });
  }

  // Toggle the boolean value
  faq.faq = !faq.faq;
  const updatedFaq = await faq.save();

  res.status(200).json({
    success: true,
    message: "Faq updated successfully",
    data: updatedFaq,
  });
});

export {
  createFaq,
  editFaq,
  deleteFaq,
  getAllFaqs,
  updateFaqHomePage,
  updateFaqFaqPage,
};
