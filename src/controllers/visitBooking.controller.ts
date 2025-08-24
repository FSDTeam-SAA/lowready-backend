import AppError from "../errors/AppError";
import { Facility } from "../models/facility.model";
import { User } from "../models/user.model";
import { VisitBooking } from "../models/visitBooking.model";
import catchAsync from "../utils/catchAsync";
import sendResponse from "../utils/sendResponse";

const createVisitBooking = catchAsync(async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      relationWith,
      message,
      facility,
      visitDate,
      visitTime,
    } = req.body;
    const { _id: userId } = req.user as any;
    const user = await User.findById(userId);
    if (!user) throw new AppError(404, "User not found");

    const isFacilityExists = await Facility.findById(facility);
    if (!isFacilityExists) throw new AppError(404, "Facility not found ");


    if (
      !isFacilityExists.availableTime ||
      !isFacilityExists.availableTime.includes(visitTime)
    ) {
      throw new AppError(
        400,
        `${visitTime} is not available. Please choose another one.`
      );
    }

    const visitBooking = await VisitBooking.create({
      userId,
      name,
      email,
      phoneNumber,
      relationWith,
      message,
      facility,
      visitDate,
      visitTime,
    });

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Visit booking created successfully",
      data: visitBooking,
    });
  } catch (error: any) {
    throw new AppError(500, error.message);
  }
});

const visitBookingController = {
  createVisitBooking,
};
export default visitBookingController;
