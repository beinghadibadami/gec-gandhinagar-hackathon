import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const sessionSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            default: uuid,
        },
        patientId: {
            type: String,

        },
        type: {
            type: String,
            enum: ["In-person", "Online"],
            required: true,
        },

        date: {
            type: Date,
            required: true,
        },
        timeSlot: {
            type: String, // Example: "10:00 AM - 11:00 AM"
            required: true,
        },
        sessionLink: {
            type: String,
            required: true,
            default: uuid,
        },
        duration: {
            type: Number, // Duration in minutes
            required: true,
        },
        status: {
            type: String,
            enum: ["scheduled", "completed", "cancelled"],
            default: "scheduled",
        },
        notes: {
            type: String,
        },
    },
    { timestamps: true }
);

const doctorSchema = new mongoose.Schema(
    {
        doctorId: {
            type: String,
            required: true,
            unique: true,
            default: uuid,
        },
        firstName: {
            type: String,
            required: true,
        },
        middleName: {
            type: String,
        },
        lastName: {
            type: String,
            required: true,
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },
        DOB: {
            type: Date,
        },
        email: {
            type: String,
            required: true,
            match: [/\S+@\S+\.\S+/, "Invalid email format"],
            unique: true,
        },
        mobileNo: {
            type: Number,
        },
        countryCallingCode: {
            type: String,
        },
        password: {
            type: String,
            required: true,
        },
        aboutDoctor: {
            type: String,

        },
        salt: {
            type: String,
            required: true,
        },
        profileImageUrl: {
            type: String,
        },
        isVerified: {
            type: Boolean,
            required: true,
            default: false,
        },
        languages: [{
            type: String,
            required: true,
        }],
        specialization: [{
            type: String,
            required: true,
        }],
        degrees: [
            {
                degreeName: {
                    type: String,
                    required: true,
                },
                institution: {
                    type: String,
                },
                yearOfCompletion: {
                    type: Number,
                },
                verifiedProof: {
                    type: String,
                }
            },
        ],
        experience: {
            type: Number, // Years of experience
            required: true,
        },
        hospitalAffiliations: [
            {
                name: {
                    type: String,
                },
                location: {
                    type: String,
                },
            },
        ],
        location: {
            type: String,
        },
        consultationFee: {
            type: Number,
        },
        availableTimeSlots: [
            {
                day: {
                    type: String,
                    required: true,
                },
                timeSlot: {
                    type: String, // Example: "10:00 AM - 12:00 PM"
                    required: true,
                },
                consultationFee: {
                    type: Number,
                    required: true,
                }
            },
        ],
        sessions: [sessionSchema], // List of scheduled sessions
    },
    {
        timestamps: true,
    }
);

const doctorModel = mongoose.model("doctorDetails", doctorSchema);
export default doctorModel;
