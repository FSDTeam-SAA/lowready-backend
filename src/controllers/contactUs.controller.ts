import AppError from "../errors/AppError";
import catchAsync from "../utils/catchAsync";
import { sendEmail } from "../utils/sendEmail";
import sendMessageTemplate from "../utils/sendMessageTemplate";
import sendResponse from "../utils/sendResponse";

const createContactUs = catchAsync(async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    const fullName = `${firstName} ${lastName}`;
    const subject = `New Contact Us Message from ${fullName}`;
    const html = sendMessageTemplate({
      email,
      subject,
      message,
    });

    const result = await sendEmail("tahsin.bdcalling@gmail.com", subject, html);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Contact us message sent successfully!",
      data: result,
    });
  } catch (error) {
    throw new AppError(500, "Failed to send contact us message");
  }
});

const contractUsController = {
  createContactUs,
};
export default contractUsController;
