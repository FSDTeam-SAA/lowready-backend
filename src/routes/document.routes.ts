import { Router } from "express";

import { getAllDocuments, getDocumentsByUploader, uploadDocument } from "../controllers/docuement.controller";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

// Upload new document (with file)
router.post("/upload", upload.single("file"), uploadDocument);

// Get all documents
router.get("/", getAllDocuments);

// Get documents by uploader ID
router.get("/uploader/:uploaderId", getDocumentsByUploader);


const documentRouter = router

export default documentRouter