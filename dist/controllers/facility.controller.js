"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const bookHome_model_1 = require("../models/bookHome.model");
const facility_model_1 = require("../models/facility.model");
const user_model_1 = require("../models/user.model");
const visitBooking_model_1 = require("../models/visitBooking.model");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const cloudinary_1 = require("../utils/cloudinary");
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const createFacility = (0, catchAsync_1.default)(async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const user = await user_model_1.User.findById(userId);
        if (!user) {
            throw new AppError_1.default(404, "User not found");
        }
        const files = req.files;
        // ---------------- Images ----------------
        let images = [];
        if (files?.image && files.image.length > 0) {
            for (const file of files.image) {
                const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(file.path, "facilities");
                if (uploadResult) {
                    images.push({
                        public_id: uploadResult.public_id,
                        url: uploadResult.secure_url,
                    });
                }
            }
        }
        else {
            throw new AppError_1.default(400, "At least one image is required");
        }
        // ---------------- Video ----------------
        let uploadVideo = "";
        if (files?.video && files.video.length > 0) {
            const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(files.video[0].path, "facilities");
            if (uploadResult)
                uploadVideo = uploadResult.secure_url;
        }
        // ---------------- Medicaid Programs ----------------
        let medicaidPrograms = [];
        if (files?.medical && files.medical.length > 0) {
            for (const file of files.medical) {
                const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(file.path, "medical");
                if (uploadResult)
                    medicaidPrograms.push({
                        public_id: uploadResult.public_id,
                        url: uploadResult.secure_url,
                    });
            }
        }
        // ---------------- Amenities Services ----------------
        let amenitiesServices = [];
        if (files?.amenitiesServices && files.amenitiesServices.length > 0) {
            for (let i = 0; i < files.amenitiesServices.length; i++) {
                const file = files.amenitiesServices[i];
                const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(file.path, "amenities");
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
        let { services, availableTime, base, location, facilityLicenseNumber, rating, address, ...rest } = req.body;
        // ---------------- Validation ----------------
        if ((!facilityLicenseNumber || facilityLicenseNumber.trim() === "") &&
            (!medicaidPrograms || medicaidPrograms.length === 0)) {
            throw new AppError_1.default(400, "Facility License Number or Medicaid Programs of at least one is required");
        }
        if (!base)
            throw new AppError_1.default(400, "Base plan is required");
        if (!location)
            throw new AppError_1.default(400, "Location is required");
        // ---------------- Create Facility ----------------
        const facility = await facility_model_1.Facility.create({
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
        return (0, sendResponse_1.default)(res, {
            statusCode: 201,
            success: true,
            message: "Facility created successfully",
            data: facility,
        });
    }
    catch (error) {
        console.log({ error });
        throw new AppError_1.default(500, "Failed to create facility");
    }
});
const getMyFacilities = (0, catchAsync_1.default)(async (req, res) => {
    const { _id: userId } = req.user;
    const facilities = await facility_model_1.Facility.find({ userId }).populate({
        path: "userId",
        select: "firstName lastName email phoneNumber",
    });
    return (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Facilities retrieved successfully",
        data: facilities,
    });
});
const getAllFacilities = (0, catchAsync_1.default)(async (req, res) => {
    const { search, location, minPrice, maxPrice, careServices, amenities, rating, // ⭐ Rating filter
    availability, // ✅ New: availability (true/false/all)
    status, // ✅ New: pending, approved, rejected, etc.
    page = 1, limit = 10, } = req.query;
    const filter = {};
    // 🔎 Search by name or location
    if (search) {
        const searchValue = search.trim();
        filter.$or = [
            { name: { $regex: searchValue, $options: "i" } },
            { location: { $regex: searchValue, $options: "i" } },
        ];
    }
    // 📍 Location filter
    if (location) {
        const locationValue = location.trim();
        filter.location = { $regex: locationValue, $options: "i" };
    }
    // 💰 Price range filter
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice)
            filter.price.$gte = Number(minPrice);
        if (maxPrice)
            filter.price.$lte = Number(maxPrice);
    }
    // 🏥 Care services filter
    if (careServices) {
        const servicesArray = careServices
            .split(",")
            .map((s) => s.trim());
        filter.careServices = { $in: servicesArray };
    }
    // 🛎️ Amenities filter
    if (amenities) {
        const amenitiesArray = amenities
            .split(",")
            .map((a) => a.trim());
        filter.amenities = { $in: amenitiesArray };
    }
    // ⭐ Rating filter
    if (rating) {
        const ratingValue = Number(rating);
        if (!isNaN(ratingValue) && ratingValue >= 1 && ratingValue <= 5) {
            filter.rating = {
                $gte: ratingValue,
                $lt: ratingValue + 1,
            };
        }
    }
    // ✅ Availability filter
    if (availability && availability !== "all") {
        if (availability === "true") {
            filter.availability = true;
        }
        else if (availability === "false") {
            filter.availability = false;
        }
    }
    // ✅ Status filter (e.g., pending, approved, rejected)
    if (status) {
        filter.status = status;
    }
    // 📄 Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const facilities = await facility_model_1.Facility.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .populate({
        path: "userId",
        select: "firstName lastName email phoneNumber",
    })
        .sort({ createdAt: -1 });
    const total = await facility_model_1.Facility.countDocuments(filter);
    return (0, sendResponse_1.default)(res, {
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
const updateFacility = (0, catchAsync_1.default)(async (req, res) => {
    try {
        const { facilityId } = req.params;
        const facility = await facility_model_1.Facility.findById(facilityId);
        if (!facility) {
            throw new AppError_1.default(404, "Facility not found");
        }
        const files = req.files;
        // ---------------- Upload New Images ----------------
        const newImages = [];
        if (files?.image?.length) {
            for (const file of files.image) {
                const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(file.path, "facilities");
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
            const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(files.video[0].path, "facilities");
            if (uploadResult)
                newUploadVideo = uploadResult.secure_url;
        }
        // ---------------- Upload Medicaid Files ----------------
        const newMedicaidPrograms = [];
        if (files?.medical?.length) {
            for (const file of files.medical) {
                const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(file.path, "medical");
                if (uploadResult) {
                    newMedicaidPrograms.push({
                        public_id: uploadResult.public_id,
                        url: uploadResult.secure_url,
                    });
                }
            }
        }
        // ---------------- Upload Amenities Services ----------------
        const newAmenitiesServices = [];
        const names = req.body.amenitiesServicesName;
        if (files?.amenitiesServices?.length) {
            for (let i = 0; i < files.amenitiesServices.length; i++) {
                const file = files.amenitiesServices[i];
                const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(file.path, "amenities");
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
        const { deleteImageIds, deleteAmenitiesServiceNames, deleteVideo, deleteMedicaidIds, } = req.body;
        const imageIdsToDelete = typeof deleteImageIds === "string"
            ? deleteImageIds.split(",")
            : Array.isArray(deleteImageIds)
                ? deleteImageIds
                : [];
        const amenityNamesToDelete = typeof deleteAmenitiesServiceNames === "string"
            ? deleteAmenitiesServiceNames.split(",")
            : Array.isArray(deleteAmenitiesServiceNames)
                ? deleteAmenitiesServiceNames
                : [];
        const medicaidIdsToDelete = typeof deleteMedicaidIds === "string"
            ? deleteMedicaidIds.split(",")
            : Array.isArray(deleteMedicaidIds)
                ? deleteMedicaidIds
                : [];
        const updatedImages = Array.isArray(facility.images)
            ? facility.images.filter((img) => !imageIdsToDelete.includes(img.public_id))
            : [];
        const updatedAmenitiesServices = Array.isArray(facility.amenitiesServices)
            ? facility.amenitiesServices.filter((s) => !amenityNamesToDelete.includes(s.name))
            : [];
        const updatedMedicaid = Array.isArray(facility.medicaidPrograms)
            ? facility.medicaidPrograms.filter((file) => !medicaidIdsToDelete.includes(file.public_id))
            : [];
        const updatedVideo = deleteVideo === "true" ? "" : facility.uploadVideo;
        const { services, availableTime, base, location, facilityLicenseNumber, rating, address, ...rest } = req.body;
        const updatedFacility = await facility_model_1.Facility.findByIdAndUpdate(facility._id, {
            ...rest,
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
        }, { new: true, runValidators: true });
        return (0, sendResponse_1.default)(res, {
            statusCode: 200,
            success: true,
            message: "Facility updated successfully",
            data: updatedFacility,
        });
    }
    catch (error) {
        console.error(error);
        throw new AppError_1.default(500, "Failed to update facility");
    }
});
const getSingleFacility = (0, catchAsync_1.default)(async (req, res) => {
    const { facilityId } = req.params;
    const facility = await facility_model_1.Facility.findById(facilityId).populate({
        path: "userId",
        select: "firstName lastName email phoneNumber",
    });
    if (!facility) {
        throw new AppError_1.default(404, "Facility not found");
    }
    return (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Facility retrieved successfully",
        data: facility,
    });
});
const getAllFacilitiesLocations = (0, catchAsync_1.default)(async (req, res) => {
    const facilities = await facility_model_1.Facility.find().select('location');
    return (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Facilities locations retrieved successfully",
        data: facilities,
    });
});
const facilityDashboardSummary = (0, catchAsync_1.default)(async (req, res) => {
    const { _id: userId } = req.user;
    const { facilityId } = req.params;
    const user = await user_model_1.User.findById(userId);
    if (!user)
        throw new AppError_1.default(404, "User not found");
    const facilities = await facility_model_1.Facility.find({
        userId,
        _id: new mongoose_1.default.Types.ObjectId(facilityId),
    });
    if (!facilities || facilities.length === 0) {
        throw new AppError_1.default(404, "Facility not found");
    }
    const visitTour = await visitBooking_model_1.VisitBooking.countDocuments({ facility: facilityId });
    const facilityBookings = await bookHome_model_1.BookHome.countDocuments({ facility: facilityId });
    return (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Facilities retrieved successfully",
        data: {
            visitTour,
            facilityBookings,
        },
    });
});
const updateFacilityStatus = (0, catchAsync_1.default)(async (req, res) => {
    const { facilityId } = req.params;
    const { status } = req.body;
    const facility = await facility_model_1.Facility.findById(facilityId);
    if (!facility) {
        throw new AppError_1.default(404, "Facility not found");
    }
    const updatedFacility = await facility_model_1.Facility.findByIdAndUpdate(facilityId, { status }, { new: true, runValidators: true });
    return (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Facility status updated successfully",
        data: updatedFacility,
    });
});
const facilityController = {
    createFacility,
    getMyFacilities,
    getAllFacilities,
    updateFacility,
    getSingleFacility,
    getAllFacilitiesLocations,
    facilityDashboardSummary,
    updateFacilityStatus
};
exports.default = facilityController;
