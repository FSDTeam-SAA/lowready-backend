"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Facility = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const facilitySchema = new mongoose_1.Schema({
    availability: { type: Boolean, default: true },
    name: { type: String, required: [true, "Name is required"] },
    location: { type: String, required: [true, "Location is required"] },
    description: { type: String, required: [true, "Description is required"] },
    price: { type: Number, required: [true, "Price is required"] },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    images: [
        {
            public_id: {
                type: String,
                default: "",
            },
            url: { type: String, default: "" },
        },
    ],
    base: {
        type: String,
        enum: ["monthly", "yearly"],
        required: [true, "Select a base plan"],
    },
    careServices: [
        {
            type: String,
            enum: [
                "Personal Care",
                "Directed Care",
                "Supervisory Care",
                "Memory Care",
                "Respite and Short Term Care",
                "Behavioral Care",
            ],
            required: [true, "Select at least one amenity"],
        },
    ],
    amenities: [{ type: String, required: [true, "Amenity is required"] }],
    amenitiesServices: [
        {
            name: { type: String, required: [true, "Name is required"] },
            image: {
                public_id: { type: String, default: "" },
                url: { type: String, default: "" },
            },
            _id: false,
        },
    ],
    about: { type: String, required: [true, "About is required"] },
    videoTitle: { type: String, required: [true, "Video title is required"] },
    videoDescription: {
        type: String,
        required: [true, "Video description is required"],
    },
    uploadVideo: { type: String, default: "" },
    availableTime: [
        { type: String, required: [true, "Available time is required"] },
    ],
    facilityLicenseNumber: {
        type: String,
    },
    medicaidPrograms: [
        {
            public_id: {
                type: String,
                default: "",
            },
            url: { type: String, default: "" },
        },
        { _id: false },
    ],
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },
    ratingCount: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },
    status: {
        type: String,
        enum: ["approved", "pending", "declined"],
        default: "pending",
    },
    totalTour: { type: Number, default: 0 },
    totalPlacement: { type: Number, default: 0 },
}, { timestamps: true });
exports.Facility = mongoose_1.default.model("Facility", facilitySchema);
