import doctorModel from "../models/doctor.js";
import { APIError, STATUS_CODES, ValidationError } from "../../utils/app-errors.js";
import { paginateAndFilter } from "../../utils/index.js";

// Dealing with database operations for doctors
export default class DoctorRepository {
    // Create a new doctor
    async createDoctor(body) {
        try {
            const doctor = await doctorModel.create(body);

            if (!doctor) {
                throw new APIError(
                    "Doctor Creation Failed",
                    STATUS_CODES.BAD_REQUEST,
                    "Unable to create doctor."
                );
            }

            // Return doctor object if successful
            return doctor;
        } catch (err) {
            console.error(err);

            if (err.name === 'ValidationError') {
                throw new ValidationError("Doctor validation failed: " + err.message, err.stack);
            }
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to create doctor.",
                false,
                err.stack
            );
        }
    }

    // Verify a doctor's account
    async verifyDoctor(doctorId) {
        try {
            const updatedDoctor = await doctorModel.findOneAndUpdate(
                { doctorId },
                { $set: { isVerified: true } },
                { new: true }
            );

            return updatedDoctor;
        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to verify doctor",
                false,
                err.stack
            );
        }
    }

    // Fetch paginated list of doctors with filters
    async fetchDoctors({ filters, page, limit, sort, excludeFields }) {
        try {
            const paginatedResults = await paginateAndFilter(doctorModel, {
                filters,
                page,
                limit,
                sort,
                excludeFields
            });

            return paginatedResults;
        } catch (err) {
            console.error(err);

            if (err.name === 'ValidationError') {
                throw new ValidationError("Doctor validation failed: " + err.message, err.stack);
            }
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to fetch doctors.",
                false,
                err.stack
            );
        }
    }

    // Fetch a doctor by ID
    async fetchDoctorById(doctorId) {
        try {
            const doctor = await doctorModel.findOne(
                { doctorId }
            ).select(["-password", "-salt"]);

            return doctor;
        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to find doctor",
                false,
                err.stack
            );
        }
    }

    // Update doctor information
    async updateDoctor(doctorId, body) {
        try {
            const doctor = await doctorModel.findOneAndUpdate(
                { doctorId },
                { $set: body },
                { new: true }
            );

            return doctor;
        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to update doctor",
                false,
                err.stack
            );
        }
    }

    // Delete a doctor
    async deleteDoctor(doctorId) {
        try {
            const deletedDoctor = await doctorModel.deleteOne({ doctorId });

            return deletedDoctor;
        } catch (err) {
            console.log(err);
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to delete doctor",
                false,
                err.stack
            );
        }
    }

    // Find a doctor by email
    async findDoctorByEmail(email) {
        try {
            const existingDoctor = await doctorModel.findOne({ email });

            if (!existingDoctor) {
                return { message: "Doctor not found", status: 404 };
            }

            return { message: "Doctor found successfully", doctor: existingDoctor };
        } catch (err) {
            console.log(err);
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to find doctor",
                false,
                err.stack
            );
        }
    }

    // Reset doctor's password
    async resetDoctorPassword(email, newPassword, newSalt) {
        try {
            const doctor = await doctorModel.findOneAndUpdate(
                { email },
                { $set: { password: newPassword, salt: newSalt } },
                { new: true }
            );

            return doctor;
        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to update password",
                false,
                err.stack
            );
        }
    }

    // Add availability time slots
    async addAvailableTimeSlots(doctorId, timeSlots) {
        try {
            const doctor = await doctorModel.findOneAndUpdate(
                { doctorId },
                { $push: { availableTimeSlots: { $each: timeSlots } } },
                { new: true }
            );

            return doctor;
        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to add time slots",
                false,
                err.stack
            );
        }
    }

    // Update availability time slots
    async updateAvailableTimeSlot(doctorId, slotId, updatedSlot) {
        try {
            const doctor = await doctorModel.findOneAndUpdate(
                {
                    doctorId,
                    "availableTimeSlots._id": slotId
                },
                {
                    $set: {
                        "availableTimeSlots.$": updatedSlot
                    }
                },
                { new: true }
            );

            return doctor;
        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to update time slot",
                false,
                err.stack
            );
        }
    }

    // Remove availability time slots
    async removeAvailableTimeSlot(doctorId, slotId) {
        try {
            const doctor = await doctorModel.findOneAndUpdate(
                { doctorId },
                { $pull: { availableTimeSlots: { _id: slotId } } },
                { new: true }
            );

            return doctor;
        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to remove time slot",
                false,
                err.stack
            );
        }
    }

    // Book a new session
    async createSession(doctorId, sessionData) {
        try {
            const doctor = await doctorModel.findOneAndUpdate(
                { doctorId },
                { $push: { sessions: sessionData } },
                { new: true }
            );

            // Get the newly created session
            const newSession = doctor.sessions[doctor.sessions.length - 1];

            return newSession;
        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to create session",
                false,
                err.stack
            );
        }
    }

    // Update a session
    async updateSession(doctorId, sessionId, updateData) {
        try {
            // Create a dynamic update object
            const updateFields = {};
            Object.keys(updateData).forEach(key => {
                updateFields[`sessions.$.${key}`] = updateData[key];
            });

            const doctor = await doctorModel.findOneAndUpdate(
                {
                    doctorId,
                    "sessions.sessionId": sessionId
                },
                { $set: updateFields },
                { new: true }
            );

            // Find the updated session
            const updatedSession = doctor.sessions.find(
                session => session.sessionId === sessionId
            );

            return updatedSession;
        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to update session",
                false,
                err.stack
            );
        }
    }

    // Cancel a session
    async cancelSession(doctorId, sessionId) {
        try {
            const doctor = await doctorModel.findOneAndUpdate(
                {
                    doctorId,
                    "sessions.sessionId": sessionId
                },
                {
                    $set: {
                        "sessions.$.status": "cancelled"
                    }
                },
                { new: true }
            );

            // Find the cancelled session
            const cancelledSession = doctor.sessions.find(
                session => session.sessionId === sessionId
            );

            return cancelledSession;
        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to cancel session",
                false,
                err.stack
            );
        }
    }

    // Complete a session
    async completeSession(doctorId, sessionId, notes) {
        try {
            const doctor = await doctorModel.findOneAndUpdate(
                {
                    doctorId,
                    "sessions.sessionId": sessionId
                },
                {
                    $set: {
                        "sessions.$.status": "completed",
                        "sessions.$.notes": notes
                    }
                },
                { new: true }
            );

            // Find the completed session
            const completedSession = doctor.sessions.find(
                session => session.sessionId === sessionId
            );

            return completedSession;
        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to complete session",
                false,
                err.stack
            );
        }
    }

    // Get all sessions for a doctor
    async fetchDoctorSessions(doctorId, status) {
        try {
            let query = { doctorId };
            let projection = { sessions: 1, _id: 0 };

            const doctor = await doctorModel.findOne(query).select(projection);

            if (!doctor) {
                throw new APIError(
                    "Not Found",
                    STATUS_CODES.NOT_FOUND,
                    "Doctor not found"
                );
            }

            let sessions = doctor.sessions;

            // Filter by status if provided
            if (status) {
                sessions = sessions.filter(session => session.status === status);
            }

            return sessions;
        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to fetch sessions",
                false,
                err.stack
            );
        }
    }

    // Get a specific session
    async fetchSessionById(doctorId, sessionId) {
        try {
            const doctor = await doctorModel.findOne({ doctorId });

            if (!doctor) {
                throw new APIError(
                    "Not Found",
                    STATUS_CODES.NOT_FOUND,
                    "Doctor not found"
                );
            }

            const session = doctor.sessions.find(
                session => session.sessionId === sessionId
            );

            if (!session) {
                throw new APIError(
                    "Not Found",
                    STATUS_CODES.NOT_FOUND,
                    "Session not found"
                );
            }

            return session;
        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to fetch session",
                false,
                err.stack
            );
        }
    }

    // Get sessions by patient ID
    async fetchSessionsByPatient(doctorId, patientId) {
        try {
            const doctor = await doctorModel.findOne({ doctorId });

            if (!doctor) {
                throw new APIError(
                    "Not Found",
                    STATUS_CODES.NOT_FOUND,
                    "Doctor not found"
                );
            }

            const sessions = doctor.sessions.filter(
                session => session.patientId === patientId
            );

            return sessions;
        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to fetch patient sessions",
                false,
                err.stack
            );
        }
    }

    // Add or update a degree
    async updateDegree(doctorId, degreeData) {
        try {
            let doctor;

            // If there's an _id, we're updating an existing degree
            if (degreeData._id) {
                doctor = await doctorModel.findOneAndUpdate(
                    {
                        doctorId,
                        "degrees._id": degreeData._id
                    },
                    {
                        $set: {
                            "degrees.$": degreeData
                        }
                    },
                    { new: true }
                );
            } else {
                // Otherwise, we're adding a new degree
                doctor = await doctorModel.findOneAndUpdate(
                    { doctorId },
                    { $push: { degrees: degreeData } },
                    { new: true }
                );
            }

            return doctor;
        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to update degree",
                false,
                err.stack
            );
        }
    }

    // Remove a degree
    async removeDegree(doctorId, degreeId) {
        try {
            const doctor = await doctorModel.findOneAndUpdate(
                { doctorId },
                { $pull: { degrees: { _id: degreeId } } },
                { new: true }
            );

            return doctor;
        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to remove degree",
                false,
                err.stack
            );
        }
    }

    // Add or update hospital affiliation
    async updateHospitalAffiliation(doctorId, affiliationData) {
        try {
            let doctor;

            // If there's an _id, we're updating an existing affiliation
            if (affiliationData._id) {
                doctor = await doctorModel.findOneAndUpdate(
                    {
                        doctorId,
                        "hospitalAffiliations._id": affiliationData._id
                    },
                    {
                        $set: {
                            "hospitalAffiliations.$": affiliationData
                        }
                    },
                    { new: true }
                );
            } else {
                // Otherwise, we're adding a new affiliation
                doctor = await doctorModel.findOneAndUpdate(
                    { doctorId },
                    { $push: { hospitalAffiliations: affiliationData } },
                    { new: true }
                );
            }

            return doctor;
        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to update hospital affiliation",
                false,
                err.stack
            );
        }
    }

    // Remove a hospital affiliation
    async removeHospitalAffiliation(doctorId, affiliationId) {
        try {
            const doctor = await doctorModel.findOneAndUpdate(
                { doctorId },
                { $pull: { hospitalAffiliations: { _id: affiliationId } } },
                { new: true }
            );

            return doctor;
        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to remove hospital affiliation",
                false,
                err.stack
            );
        }
    }

    // Update specializations
    async updateSpecializations(doctorId, specializations) {
        try {
            const doctor = await doctorModel.findOneAndUpdate(
                { doctorId },
                { $set: { specialization: specializations } },
                { new: true }
            );

            return doctor;
        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to update specializations",
                false,
                err.stack
            );
        }
    }

    // Update languages
    async updateLanguages(doctorId, languages) {
        try {
            const doctor = await doctorModel.findOneAndUpdate(
                { doctorId },
                { $set: { languages: languages } },
                { new: true }
            );

            return doctor;
        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to update languages",
                false,
                err.stack
            );
        }
    }

    // Search for doctors by various criteria
    async searchDoctors({
        name,
        specialization,
        language,
        location,
        minExperience,
        maxFee,
        page = 1,
        limit = 10
    }) {
        try {
            // Build the query object
            const query = {};

            if (name) {
                // Search in first name or last name
                query.$or = [
                    { firstName: { $regex: name, $options: 'i' } },
                    { lastName: { $regex: name, $options: 'i' } }
                ];
            }

            if (specialization) {
                query.specialization = { $in: [specialization] };
            }

            if (language) {
                query.languages = { $in: [language] };
            }

            if (location) {
                query.location = { $regex: location, $options: 'i' };
            }

            if (minExperience) {
                query.experience = { $gte: parseInt(minExperience) };
            }

            if (maxFee) {
                query.consultationFee = { $lte: parseInt(maxFee) };
            }

            // Calculate pagination values
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Execute query with pagination
            const doctors = await doctorModel.find(query)
                .select(["-password", "-salt"])
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ experience: -1 }); // Sort by experience, highest first

            // Get total count for pagination
            const total = await doctorModel.countDocuments(query);

            return {
                doctors,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit))
                }
            };

        } catch (err) {
            throw new APIError(
                "API Error",
                STATUS_CODES.INTERNAL_ERROR,
                "Unable to search doctors",
                false,
                err.stack
            );
        }
    }
}