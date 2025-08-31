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
exports.VisitBooking = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const visitBookingSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: [true, "Name is required"] },
    email: { type: String, required: [true, "Email is required"] },
    phoneNumber: { type: String, required: [true, "Phone number is required"] },
    relationWith: { type: String, required: [true, "Relation is required"] },
    message: { type: String, required: [true, "Message is required"] },
    facility: { type: mongoose_1.Schema.Types.ObjectId, ref: "Facility" },
    visitDate: { type: Date, required: [true, "Visit date is required"] },
    visitTime: { type: String, required: [true, "Visit time is required"] },
    rating: { type: Number, max: 5, default: 0 },
    status: {
        type: String,
        enum: ["upcoming", "completed", "cancelled"],
        default: "upcoming",
    },
    feedback: { type: String },
}, { timestamps: true, versionKey: false });
exports.VisitBooking = mongoose_1.default.model("VisitBooking", visitBookingSchema);
