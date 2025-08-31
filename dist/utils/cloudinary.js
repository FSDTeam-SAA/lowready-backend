"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const config_1 = __importDefault(require("../config/config"));
// configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: config_1.default.cloudinary.cloudName,
    api_key: config_1.default.cloudinary.apiKey,
    api_secret: config_1.default.cloudinary.apiSecret,
});
// upload file
const uploadToCloudinary = async (filePath, folder) => {
    try {
        const result = await cloudinary_1.v2.uploader.upload(filePath, {
            folder,
            resource_type: "auto",
        });
        // delete local file after upload
        fs_1.default.unlinkSync(filePath);
        return {
            public_id: result.public_id,
            secure_url: result.secure_url,
        };
    }
    catch (error) {
        throw new Error("Failed to upload file to Cloudinary");
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
// delete file
const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary_1.v2.uploader.destroy(publicId);
    }
    catch (error) {
        throw new Error("Failed to delete file from Cloudinary");
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
