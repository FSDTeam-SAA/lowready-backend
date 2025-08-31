"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const docuement_controller_1 = require("../controllers/docuement.controller");
const multer_middleware_1 = require("../middlewares/multer.middleware");
const router = (0, express_1.Router)();
// Upload new document (with file)
router.post("/upload", multer_middleware_1.upload.single("file"), docuement_controller_1.uploadDocument);
// Get all documents
router.get("/", docuement_controller_1.getAllDocuments);
// Get documents by uploader ID
router.get("/uploader/:uploaderId", docuement_controller_1.getDocumentsByUploader);
const documentRouter = router;
exports.default = documentRouter;
