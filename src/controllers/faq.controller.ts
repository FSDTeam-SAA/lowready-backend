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
  const faqs = await Faq.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: faqs,
  });
});

export { createFaq, editFaq, deleteFaq, getAllFaqs };
