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

    let image = { public_id: "", url: "" };
    if (req.file) {
    //   console.log(req.file);
      const uploadResult = await uploadToCloudinary(req.file.path);
    //   console.log(12, uploadResult);
      if (uploadResult) {
        image = {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
        };
      }
    }

    const video = req.files?.video as Express.Multer.File[];
    let uploadVideo: string[] = [];
    if (video) {
      for (const file of video) {
        const uploadResult = await uploadToCloudinary(file.path);
        if (uploadResult) {
          uploadVideo.push(uploadResult.secure_url);
        }
      }
    }

    const facility = await Facility.create({
      ...req.body,
      image,
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
