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

    const alreadyHasFacility = await Facility.findOne({ userId });
    if (alreadyHasFacility) {
      throw new AppError(400, "You already have a facility");
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

    let { services, availableTime, base, location, ...rest } = req.body;

    if (!base) throw new AppError(400, "Base plan is required");
    if (!location) throw new AppError(400, "Location is required");

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
    console.log({ error });
    throw new AppError(500, "Failed to create facility");
  }
});

const getMyFacilities = catchAsync(async (req, res) => {
  const { _id: userId } = req.user as any;

  const facilities = await Facility.find({ userId }).populate({
    path: "userId",
    select: "firstName lastName email phoneNumber",
  });

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Facilities retrieved successfully",
    data: facilities,
  });
});

const getAllFacilities = catchAsync(async (req, res) => {
  const facilities = await Facility.find();

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All Facilities  successfully",
    data: facilities,
  });
});

const updateFacility = catchAsync(async (req, res) => {
  try {
    const { _id: userId } = req.user as any;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    const facility = await Facility.findOne({ userId });
    if (!facility) {
      throw new AppError(404, "Facility not found");
    }

    if (facility.userId.toString() !== userId.toString()) {
      throw new AppError(403, "You are not authorized to update this facility");
    }

    // Handle images
    let images: { public_id: string; url: string }[] = [];
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
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
    }

    // // If you want image to be optional → comment this block
    // if (images.length === 0 && facility.images.length === 0) {
    //   throw new AppError(400, "At least one image is required");
    // }

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

    let { services, availableTime, base, location, ...rest } = req.body;

    const updatedFacility = await Facility.findByIdAndUpdate(
      facility._id,
      {
        ...rest,
        userId,
        base,
        location,
        services,
        availableTime,
        images:
          images.length > 0 ? [...facility.images, ...images] : facility.images,
        uploadVideo: uploadVideo || facility.uploadVideo,
      },
      { new: true, runValidators: true }
    );

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Facility updated successfully",
      data: updatedFacility,
    });
  } catch (error) {
    console.log(error);
    throw new AppError(500, "Failed to update facility");
  }
});

const getSingleFacility = catchAsync(async (req, res) => {
  const { facilityId } = req.params;

  const facility = await Facility.findById(facilityId);
  if (!facility) {
    throw new AppError(404, "Facility not found");
  }

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Facility retrieved successfully",
    data: facility,
  });
});

const facilityController = {
  createFacility,
  getMyFacilities,
  getAllFacilities,
  updateFacility,
  getSingleFacility,
};
export default facilityController;
