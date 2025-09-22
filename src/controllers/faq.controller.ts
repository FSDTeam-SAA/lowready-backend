import { Faq } from "../models/faq.model";
import catchAsync from "../utils/catchAsync";

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

export { createFaq };
