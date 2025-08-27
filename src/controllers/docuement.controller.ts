import { Request, Response } from "express";
import { UserDocument } from "../models/document.model";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary";

// 📌 Upload a new document
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { uploader, type } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Upload new file to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.path, "documents");

    // (Optional) If user already has a document of same type, remove old file
    const existingDoc = await UserDocument.findOne({ uploader, type });
    if (existingDoc?.file?.public_id) {
      await deleteFromCloudinary(existingDoc.file.public_id);
    }

    // Save new document
    const document = new UserDocument({
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload document",
    });
  }
};

// 📌 Get all documents
export const getAllDocuments = async (req: Request, res: Response) => {
  try {
    const documents = await UserDocument.find().populate("uploader");
    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch documents",
    });
  }
};

// 📌 Get documents by uploader ID
export const getDocumentsByUploader = async (req: Request, res: Response) => {
  try {
    const { uploaderId } = req.params;
    const documents = await UserDocument.find({ uploader: uploaderId }).populate("uploader");

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch documents",
    });
  }
};
