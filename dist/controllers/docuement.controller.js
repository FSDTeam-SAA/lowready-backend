"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocumentsByUploader = exports.getAllDocuments = exports.uploadDocument = void 0;
const document_model_1 = require("../models/document.model");
const cloudinary_1 = require("../utils/cloudinary");
// 📌 Upload a new document
const uploadDocument = async (req, res) => {
    try {
        const { uploader, type } = req.body;
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }
        // Upload new file to Cloudinary
        const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(req.file.path, "documents");
        // (Optional) If user already has a document of same type, remove old file
        const existingDoc = await document_model_1.UserDocument.findOne({ uploader, type });
        if (existingDoc?.file?.public_id) {
            await (0, cloudinary_1.deleteFromCloudinary)(existingDoc.file.public_id);
        }
        // Save new document
        const document = new document_model_1.UserDocument({
            uploader,
            type,
            file: {
                url: uploadResult.secure_url,
                public_id: uploadResult.public_id,
            },
        });
        await document.save();
        res.status(201).json({
            success: true,
            data: document,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to upload document",
        });
    }
};
exports.uploadDocument = uploadDocument;
// 📌 Get all documents
const getAllDocuments = async (req, res) => {
    try {
        const documents = await document_model_1.UserDocument.find().populate("uploader");
        res.status(200).json({
            success: true,
            data: documents,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch documents",
        });
    }
};
exports.getAllDocuments = getAllDocuments;
// 📌 Get documents by uploader ID
const getDocumentsByUploader = async (req, res) => {
    try {
        const { uploaderId } = req.params;
        const documents = await document_model_1.UserDocument.find({ uploader: uploaderId }).populate("uploader");
        if (!documents || documents.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No documents found for this uploader",
            });
        }
        res.status(200).json({
            success: true,
            data: documents,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch documents",
        });
    }
};
exports.getDocumentsByUploader = getDocumentsByUploader;
