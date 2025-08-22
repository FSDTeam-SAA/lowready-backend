import AppError from "../errors/AppError";
import { Facility } from "../models/facility.model";
import { User } from "../models/user.model";
import catchAsync from "../utils/catchAsync";
import { uploadToCloudinary } from "../utils/cloudinary";
import sendResponse from "../utils/sendResponse";

const createFacility = catchAsync(async (req, res) => {
  try {
    const { _id: userId } = req.user as any;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Handle images
    let images: { public_id: string; url: string }[] = [];
    if (files?.image && files.image.length > 0) {
      for (const file of files.image) {
        const uploadResult = await uploadToCloudinary(file.path, "facilities");
        if (uploadResult) {
          images.push({
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url,
          });
        }
      }
    } else {
      throw new AppError(400, "At least one image is required");
    }

    // Handle single video
    let uploadVideo = "";
    if (files?.video && files.video.length > 0) {
      const uploadResult = await uploadToCloudinary(
        files.video[0].path,
        "facilities"
      );
      if (uploadResult) {
        uploadVideo = uploadResult.secure_url;
      }
    }

    // ✅ Parse JSON fields safely
    let { services, availableTime, base, location, ...rest } = req.body;

    if (services && typeof services === "string") {
      try {
        services = JSON.parse(services);
      } catch {
        throw new AppError(400, "Invalid services format, must be JSON array");
      }
    }

    if (availableTime && typeof availableTime === "string") {
      try {
        availableTime = JSON.parse(availableTime);
      } catch {
        throw new AppError(
          400,
          "Invalid availableTime format, must be JSON array of dates"
        );
      }
    }

    if (!base) throw new AppError(400, "Base plan is required");
    if (!location) throw new AppError(400, "Location is required");

    // Create facility
    const facility = await Facility.create({
      ...rest,
      userId,
      base,
      location,
      services,
      availableTime,
      images,
      uploadVideo,
    });

    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Facility created successfully",
      data: facility,
    });
  } catch (error) {
    throw new AppError(500, "Failed to create facility");
  }
});

const facilityController = {
  createFacility,
};
export default facilityController;
