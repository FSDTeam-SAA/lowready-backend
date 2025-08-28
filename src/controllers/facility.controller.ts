import mongoose from "mongoose";
import AppError from "../errors/AppError";
import { BookHome } from "../models/bookHome.model";
import { Facility } from "../models/facility.model";
import { User } from "../models/user.model";
import { VisitBooking } from "../models/visitBooking.model";
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

    // ---------------- Images ----------------
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

    // ---------------- Video ----------------
    let uploadVideo = "";
    if (files?.video && files.video.length > 0) {
      const uploadResult = await uploadToCloudinary(
        files.video[0].path,
        "facilities"
      );
      if (uploadResult) uploadVideo = uploadResult.secure_url;
    }

    // ---------------- Medicaid Programs ----------------
    let medicaidPrograms: { public_id: string; url: string }[] = [];
    if (files?.medical && files.medical.length > 0) {
      for (const file of files.medical) {
        const uploadResult = await uploadToCloudinary(file.path, "medical");
        if (uploadResult)
          medicaidPrograms.push({
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url,
          });
      }
    }

    // ---------------- Amenities Services ----------------
    let amenitiesServices: {
      name: string;
      image: { public_id: string; url: string };
    }[] = [];
    if (files?.amenitiesServices && files.amenitiesServices.length > 0) {
      for (let i = 0; i < files.amenitiesServices.length; i++) {
        const file = files.amenitiesServices[i];
        const uploadResult = await uploadToCloudinary(file.path, "amenities");
        if (uploadResult) {
          amenitiesServices.push({
            name: Array.isArray(req.body.amenitiesServicesName)
              ? req.body.amenitiesServicesName[i]
              : req.body.amenitiesServicesName || "Amenities Service",
            image: {
              public_id: uploadResult.public_id,
              url: uploadResult.secure_url,
            },
          });
        }
      }
    }

    // ---------------- Body Fields ----------------
    let {
      services,
      availableTime,
      base,
      location,
      facilityLicenseNumber,
      rating,
      address,
      ...rest
    } = req.body;

    // ---------------- Validation ----------------
    if (
      (!facilityLicenseNumber || facilityLicenseNumber.trim() === "") &&
      (!medicaidPrograms || medicaidPrograms.length === 0)
    ) {
      throw new AppError(
        400,
        "Facility License Number or Medicaid Programs of at least one is required"
      );
    }
    if (!base) throw new AppError(400, "Base plan is required");
    if (!location) throw new AppError(400, "Location is required");

    // ---------------- Create Facility ----------------
    const facility = await Facility.create({
      ...rest,
      userId,
      base,
      location,
      address,
      services,
      availableTime,
      images,
      uploadVideo,
      facilityLicenseNumber,
      medicaidPrograms,
      amenitiesServices,
      rating,
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
  const {
    search,
    location,
    minPrice,
    maxPrice,
    careServices,
    amenities,
    rating,   // 👈 added here
    page = 1,
    limit = 10,
  } = req.query;

  const filter: any = {};

  // 🔎 Search by name or location
  if (search) {
    const searchValue = (search as string).trim();
    filter.$or = [
      { name: { $regex: searchValue, $options: "i" } },
      { location: { $regex: searchValue, $options: "i" } },
    ];
  }

  // 📍 Location filter
  if (location) {
    const locationValue = (location as string).trim();
    filter.location = { $regex: locationValue, $options: "i" };
  }

  // 💰 Price range filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // 🏥 Care services filter
  if (careServices) {
    const servicesArray = (careServices as string)
      .split(",")
      .map((s) => s.trim());
    filter.careServices = { $in: servicesArray };
  }

  // 🛎️ Amenities filter
  if (amenities) {
    const amenitiesArray = (amenities as string)
      .split(",")
      .map((a) => a.trim());
    filter.amenities = { $in: amenitiesArray };
  }

  // ⭐ Rating filter (1,2,3,4,5 but works with decimals)
  if (rating) {
    const ratingValue = Number(rating);
    if (!isNaN(ratingValue) && ratingValue >= 1 && ratingValue <= 5) {
      filter.rating = {
        $gte: ratingValue,
        $lt: ratingValue + 1,
      };
    }
  }

  // 📄 Pagination
  const skip = (Number(page) - 1) * Number(limit);

  const facilities = await Facility.find(filter)
    .skip(skip)
    .limit(Number(limit))
    .populate({
      path: "userId",
      select: "firstName lastName email phoneNumber",
    })
    .sort({ createdAt: -1 });

  const total = await Facility.countDocuments(filter);

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Facilities fetched successfully",
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
    data: facilities,
  });
});

const updateFacility = catchAsync(async (req, res) => {
  try {
    const { _id: userId } = req.user as any;

    const user = await User.findById(userId);
    if (!user) throw new AppError(404, "User not found");

    const facility = await Facility.findOne({ userId });
    if (!facility) throw new AppError(404, "Facility not found");

    if (facility.userId.toString() !== userId.toString()) {
      throw new AppError(403, "You are not authorized to update this facility");
    }

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    // ---------------- Upload New Images ----------------
    const newImages: { public_id: string; url: string }[] = [];
    if (files?.image?.length) {
      for (const file of files.image) {
        const uploadResult = await uploadToCloudinary(file.path, "facilities");
        if (uploadResult) {
          newImages.push({
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url,
          });
        }
      }
    }

    // ---------------- Upload New Video ----------------
    let newUploadVideo = "";
    if (files?.video?.length) {
      const uploadResult = await uploadToCloudinary(
        files.video[0].path,
        "facilities"
      );
      if (uploadResult) newUploadVideo = uploadResult.secure_url;
    }

    // ---------------- Upload Medicaid Files ----------------
    const newMedicaidPrograms: { public_id: string; url: string }[] = [];
    if (files?.medical?.length) {
      for (const file of files.medical) {
        const uploadResult = await uploadToCloudinary(file.path, "medical");
        if (uploadResult) {
          newMedicaidPrograms.push({
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url,
          });
        }
      }
    }

    // ---------------- Upload Amenities Services ----------------
    const newAmenitiesServices: {
      name: string;
      image: { public_id: string; url: string };
    }[] = [];

    const names = req.body.amenitiesServicesName;

    if (files?.amenitiesServices?.length) {
      for (let i = 0; i < files.amenitiesServices.length; i++) {
        const file = files.amenitiesServices[i];
        const uploadResult = await uploadToCloudinary(file.path, "amenities");
        if (uploadResult) {
          const name = Array.isArray(names)
            ? names[i]
            : typeof names === "string"
              ? names
              : "Amenities Service";

          newAmenitiesServices.push({
            name,
            image: {
              public_id: uploadResult.public_id,
              url: uploadResult.secure_url,
            },
          });
        }
      }
    }

    // ---------------- Optional Removals ----------------
    const {
      deleteImageIds,
      deleteAmenitiesServiceNames,
      deleteVideo,
      deleteMedicaidIds,
    } = req.body;

    const imageIdsToDelete: string[] =
      typeof deleteImageIds === "string"
        ? deleteImageIds.split(",")
        : Array.isArray(deleteImageIds)
          ? deleteImageIds
          : [];

    const amenityNamesToDelete: string[] =
      typeof deleteAmenitiesServiceNames === "string"
        ? deleteAmenitiesServiceNames.split(",")
        : Array.isArray(deleteAmenitiesServiceNames)
          ? deleteAmenitiesServiceNames
          : [];

    const medicaidIdsToDelete: string[] =
      typeof deleteMedicaidIds === "string"
        ? deleteMedicaidIds.split(",")
        : Array.isArray(deleteMedicaidIds)
          ? deleteMedicaidIds
          : [];

    const updatedImages = Array.isArray(facility.images)
      ? facility.images.filter(
        (img: any) => !imageIdsToDelete.includes(img.public_id)
      )
      : [];

    const updatedAmenitiesServices = Array.isArray(facility.amenitiesServices)
      ? facility.amenitiesServices.filter(
        (s: any) => !amenityNamesToDelete.includes(s.name)
      )
      : [];

    const updatedMedicaid = Array.isArray(facility.medicaidPrograms)
      ? facility.medicaidPrograms.filter(
        (file: any) => !medicaidIdsToDelete.includes(file.public_id)
      )
      : [];

    const updatedVideo = deleteVideo === "true" ? "" : facility.uploadVideo;

    // ---------------- Update Basic Fields ----------------
    const {
      services,
      availableTime,
      base,
      location,
      facilityLicenseNumber,
      rating,
      address,
      ...rest
    } = req.body;

    const updatedFacility = await Facility.findByIdAndUpdate(
      facility._id,
      {
        ...rest,
        userId,
        base,
        location,
        services,
        availableTime,
        rating,
        address,
        images: [...updatedImages, ...newImages],
        uploadVideo: newUploadVideo || updatedVideo,
        facilityLicenseNumber,
        medicaidPrograms: [...updatedMedicaid, ...newMedicaidPrograms],
        amenitiesServices: [
          ...updatedAmenitiesServices,
          ...newAmenitiesServices,
        ],
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
    console.error(error);
    throw new AppError(500, "Failed to update facility");
  }
});

const getSingleFacility = catchAsync(async (req, res) => {
  const { facilityId } = req.params;

  const facility = await Facility.findById(facilityId).populate({
    path: "userId",
    select: "firstName lastName email phoneNumber",
  });
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

const getAllFacilitiesLocations = catchAsync(async (req, res) => {
  const facilities = await Facility.find().select('location');

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Facilities locations retrieved successfully",
    data: facilities,
  });
})


const facilityDashboardSummary = catchAsync(async (req, res) => {
  const { _id: userId } = req.user as any;
  const { facilityId } = req.params;


  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found");

  const facilities = await Facility.find({
    userId,
    _id: new mongoose.Types.ObjectId(facilityId), // ensure ObjectId match
  });

  if (!facilities || facilities.length === 0) {
    throw new AppError(404, "Facility not found");
  }

  const visitTour = await VisitBooking.countDocuments({ facility: facilityId });
  const facilityBookings = await BookHome.countDocuments({ facility: facilityId });


  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Facilities retrieved successfully",
    data: {
      visitTour,
      facilityBookings,
    },
  });
});








const facilityController = {
  createFacility,
  getMyFacilities,
  getAllFacilities,
  updateFacility,
  getSingleFacility,
  getAllFacilitiesLocations,
  facilityDashboardSummary
};
export default facilityController;
