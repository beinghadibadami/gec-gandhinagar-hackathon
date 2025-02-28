import DoctorRepository from "../database/repository/doctor-repository.js";
import {
    generateSalt,
    generatePassword,
    generateForgotPasswordSignature,
    validatePassword,
    validateSignature,
    generateSignature,
} from "../utils/index.js";
import { APIError, STATUS_CODES, ValidationError } from "../utils/app-errors.js";
import {sendEmailToDoctor} from "../mails/mail.js";

// All Business logic for doctor-related operations
export default class DoctorService {
    constructor() {
        this.repository = new DoctorRepository();
    }

    // Register a new doctor
    async registerDoctor(body) {
        const { email, password, firstName, lastName, specialization, languages } = body;
        try {
            // Check for required fields
            if (!email || !password || !firstName || !lastName) {
                return {
                    message: "Please provide all required information.",
                    status: 400,
                };
            }

            // Check if specialization is provided
            if (!specialization || !specialization.length) {
                return {
                    message: "Please provide at least one specialization.",
                    status: 400,
                };
            }

            // Check if languages are provided
            if (!languages || !languages.length) {
                return {
                    message: "Please provide at least one language.",
                    status: 400,
                };
            }

            // Check if the doctor already exists
            const { doctor: existingDoctor } = await this.repository.findDoctorByEmail(email);
            if (existingDoctor) {
                return {
                    message: "Doctor already registered with this email.",
                    status: 400,
                };
            }

            // Generate salt and hashed password
            let salt = await generateSalt();
            body.salt = salt;
            body.password = await generatePassword(password, salt);

            // Create new doctor
            const doctor = await this.repository.createDoctor(body);

            // Generate token for email verification
            const token = await generateSignature({
                email: email,
                doctorId: doctor.doctorId,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
            });

            const verificationUrl = `${process.env.MAIN_FRONTEND_URL}/doctor/verify/${token}`;

            // Send welcome and verification emails
            await sendEmailToDoctor(
                email,
                "Welcome to MedConnect - Doctor Portal",
                "welcomeMail",
                { Name: `Dr. ${doctor.firstName} ${doctor.lastName}`, Link: verificationUrl }
            );

            await sendEmailToDoctor(
                email,
                "Verify Your Doctor Account",
                "verificationLinkMail",
                { Name: `Dr. ${doctor.firstName} ${doctor.lastName}`, Link: verificationUrl }
            );

            // Return success message
            return {
                message: "Doctor registered successfully! Please verify your email address.",
                status: 201,
            };
        } catch (err) {
            // Handle validation errors
            if (err instanceof ValidationError) {
                throw err;
            }

            // Handle other errors
            throw new APIError(
                "An error occurred while registering the doctor.",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Doctor login
    async loginDoctor(body) {
        const { email, password } = body;

        if (!email || !password) {
            return {
                message: "Please provide email and password",
                status: 400
            };
        }

        try {
            // Check if the doctor exists
            const { doctor: existingDoctor } = await this.repository.findDoctorByEmail(email);

            // If doctor does not exist
            if (!existingDoctor) {
                return {
                    message: "Doctor not found",
                    status: 404
                };
            }

            // Check if the doctor is verified
            if (!existingDoctor.isVerified) {
                return {
                    message: "Your account is not verified. Please check your email.",
                    status: 401
                };
            }

            // Validate password
            const validPassword = await validatePassword(
                password,
                existingDoctor.password,
                existingDoctor.salt
            );

            if (!validPassword) {
                return {
                    message: "Invalid password",
                    status: 400
                };
            }

            // Generate token upon successful login
            const token = await generateSignature({
                email: existingDoctor.email,
                doctorId: existingDoctor.doctorId,
                firstName: existingDoctor.firstName,
                lastName: existingDoctor.lastName,
            });

            return {
                message: "Login successful",
                token,
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "An error occurred during login",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Verify doctor's email
    async verifyDoctorEmail(req, token) {
        try {
            // Check if token is provided
            if (!token) {
                return {
                    message: "Verification token is missing",
                    status: 401
                };
            }

            // Validate the token
            const validToken = await validateSignature(req, token);
            if (!validToken) {
                return {
                    message: "Invalid or expired verification token",
                    status: 401
                };
            }

            // Verify the doctor
            const updatedDoctor = await this.repository.verifyDoctor(req.user.doctorId);
            if (!updatedDoctor) {
                return {
                    message: "Doctor not found",
                    status: 404
                };
            }

            return {
                message: "Email verified successfully",
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "An error occurred during email verification",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Get doctor profile
    async getDoctorProfile(doctorId) {
        try {
            const doctor = await this.repository.fetchDoctorById(doctorId);

            if (!doctor) {
                return {
                    message: "Doctor not found",
                    status: 404
                };
            }

            return {
                message: "Doctor profile retrieved successfully",
                doctor,
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error retrieving doctor profile",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Update doctor profile
    async updateDoctorProfile(doctorId, body) {
        try {
            // Prevent updating sensitive fields directly
            const { password, salt, isVerified, ...updateData } = body;

            const updatedDoctor = await this.repository.updateDoctor(doctorId, updateData);

            if (!updatedDoctor) {
                return {
                    message: "Doctor not found",
                    status: 404
                };
            }

            return {
                message: "Profile updated successfully",
                doctor: updatedDoctor,
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error updating doctor profile",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Change doctor password
    async changePassword(req, body) {
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return {
                message: "Current password and new password are required",
                status: 400
            };
        }

        try {
            // Get doctor details
            const { doctor: existingDoctor } = await this.repository.findDoctorByEmail(req.user.email);

            if (!existingDoctor) {
                return {
                    message: "Doctor not found",
                    status: 404
                };
            }

            // Verify current password
            const isValidPassword = await validatePassword(
                currentPassword,
                existingDoctor.password,
                existingDoctor.salt
            );

            if (!isValidPassword) {
                return {
                    message: "Current password is incorrect",
                    status: 400
                };
            }

            // Generate new salt and password
            const newSalt = await generateSalt();
            const hashedPassword = await generatePassword(newPassword, newSalt);

            // Update doctor with new password
            const updateData = {
                password: hashedPassword,
                salt: newSalt
            };

            const updatedDoctor = await this.repository.updateDoctor(existingDoctor.doctorId, updateData);

            if (!updatedDoctor) {
                return {
                    message: "Failed to update password",
                    status: 500
                };
            }

            return {
                message: "Password changed successfully",
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error changing password",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Forgot password request
    async forgotPasswordRequest(body) {
        const { email } = body;

        if (!email) {
            return {
                message: "Email address is required",
                status: 400
            };
        }

        try {
            const { doctor: existingDoctor } = await this.repository.findDoctorByEmail(email);

            if (existingDoctor && existingDoctor.isVerified) {
                // Generate token for password reset
                const token = await generateForgotPasswordSignature({
                    email: existingDoctor.email,
                });

                const resetPasswordUrl = `${process.env.MAIN_FRONTEND_URL}/doctor/reset-password/${token}`;

                // Send password reset email
                await sendEmailToDoctor(
                    email,
                    "Reset Your Password",
                    "forgotPasswordMail",
                    {
                        Name: `Dr. ${existingDoctor.firstName} ${existingDoctor.lastName}`,
                        Link: resetPasswordUrl
                    }
                );

                return {
                    message: "Password reset instructions sent to your email",
                    status: 200
                };
            }

            // For security reasons, don't reveal if the account exists but isn't verified
            return {
                message: "If your email is registered and verified, you will receive password reset instructions",
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error processing forgot password request",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Reset password
    async resetPassword(req, token, body) {
        const { newPassword } = body;

        if (!newPassword) {
            return {
                message: "New password is required",
                status: 400
            };
        }

        try {
            // Validate token
            const validToken = await validateSignature(req, token);

            if (!validToken) {
                return {
                    message: "Invalid or expired token",
                    status: 401
                };
            }

            // Generate new salt and password
            const newSalt = await generateSalt();
            const hashedPassword = await generatePassword(newPassword, newSalt);

            // Find doctor by email from token
            const { doctor: existingDoctor } = await this.repository.findDoctorByEmail(req.user.email);

            if (!existingDoctor) {
                return {
                    message: "Doctor not found",
                    status: 404
                };
            }

            // Update doctor with new password
            const updateData = {
                password: hashedPassword,
                salt: newSalt
            };

            const updatedDoctor = await this.repository.updateDoctor(existingDoctor.doctorId, updateData);

            if (!updatedDoctor) {
                return {
                    message: "Failed to reset password",
                    status: 500
                };
            }

            return {
                message: "Password reset successful",
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error resetting password",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Get doctor authentication info
    async getDoctorAuth(user) {
        try {
            const { doctor: existingDoctor } = await this.repository.findDoctorByEmail(user.email);

            if (!existingDoctor) {
                return {
                    message: "Doctor not found",
                    status: 404
                };
            }

            return {
                message: "Doctor is authenticated",
                status: 200,
                doctorId: existingDoctor.doctorId,
                firstName: existingDoctor.firstName,
                middleName: existingDoctor.middleName,
                lastName: existingDoctor.lastName,
                email: existingDoctor.email,
                profileImageUrl: existingDoctor.profileImageUrl,
                specialization: existingDoctor.specialization,
                experience: existingDoctor.experience,
                isVerified: existingDoctor.isVerified
            };
        } catch (err) {
            throw new APIError(
                "Error fetching doctor authentication details",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Add or update availability time slots
    async updateAvailability(doctorId, timeSlots) {
        try {
            if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
                return {
                    message: "Valid time slots are required",
                    status: 400
                };
            }

            // Validate time slots
            for (const slot of timeSlots) {
                if (!slot.day || !slot.timeSlot || !slot.consultationFee) {
                    return {
                        message: "Each time slot must include day, timeSlot, and consultationFee",
                        status: 400
                    };
                }
            }

            // Add time slots
            const doctor = await this.repository.addAvailableTimeSlots(doctorId, timeSlots);

            if (!doctor) {
                return {
                    message: "Doctor not found",
                    status: 404
                };
            }

            return {
                message: "Availability updated successfully",
                availableTimeSlots: doctor.availableTimeSlots,
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error updating availability",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Update a specific time slot
    async updateTimeSlot(doctorId, slotId, slotData) {
        try {
            if (!slotData.day || !slotData.timeSlot || !slotData.consultationFee) {
                return {
                    message: "Time slot must include day, timeSlot, and consultationFee",
                    status: 400
                };
            }

            const doctor = await this.repository.updateAvailableTimeSlot(doctorId, slotId, slotData);

            if (!doctor) {
                return {
                    message: "Doctor or time slot not found",
                    status: 404
                };
            }

            return {
                message: "Time slot updated successfully",
                availableTimeSlots: doctor.availableTimeSlots,
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error updating time slot",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Remove a time slot
    async removeTimeSlot(doctorId, slotId) {
        try {
            const doctor = await this.repository.removeAvailableTimeSlot(doctorId, slotId);

            if (!doctor) {
                return {
                    message: "Doctor or time slot not found",
                    status: 404
                };
            }

            return {
                message: "Time slot removed successfully",
                availableTimeSlots: doctor.availableTimeSlots,
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error removing time slot",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Book a new session
    async bookSession(doctorId, sessionData) {
        try {
            // Validate required fields
            const { patientId, type, date, timeSlot, duration } = sessionData;

            if (!patientId || !type || !date || !timeSlot || !duration) {
                return {
                    message: "Missing required session information",
                    status: 400
                };
            }

            // Add default values
            sessionData.status = sessionData.status || "scheduled";

            // Create the session
            const newSession = await this.repository.createSession(doctorId, sessionData);

            if (!newSession) {
                return {
                    message: "Failed to book session",
                    status: 500
                };
            }

            // Send confirmation emails to patient (assuming we have patient details)
            try {
                // This would require getting patient details from a patient service
                // For now, just log that we would send an email
                console.log(`Would send booking confirmation email to patient ${patientId}`);
            } catch (emailErr) {
                console.error("Error sending confirmation email", emailErr);
                // Continue with the function as this is not critical
            }

            return {
                message: "Session booked successfully",
                session: newSession,
                status: 201
            };
        } catch (err) {
            throw new APIError(
                "Error booking session",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Update a session
    async updateSession(doctorId, sessionId, updateData) {
        try {
            // Prevent updating certain fields directly
            const { sessionId: id, ...validUpdateData } = updateData;

            const updatedSession = await this.repository.updateSession(doctorId, sessionId, validUpdateData);

            if (!updatedSession) {
                return {
                    message: "Session not found",
                    status: 404
                };
            }

            return {
                message: "Session updated successfully",
                session: updatedSession,
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error updating session",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Cancel a session
    async cancelSession(doctorId, sessionId) {
        try {
            const cancelledSession = await this.repository.cancelSession(doctorId, sessionId);

            if (!cancelledSession) {
                return {
                    message: "Session not found",
                    status: 404
                };
            }

            // Notify patient about cancellation (would be implemented with patient service)
            try {
                console.log(`Would send cancellation email to patient ${cancelledSession.patientId}`);
            } catch (emailErr) {
                console.error("Error sending cancellation email", emailErr);
            }

            return {
                message: "Session cancelled successfully",
                session: cancelledSession,
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error cancelling session",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Complete a session with notes
    async completeSession(doctorId, sessionId, notes) {
        try {
            const completedSession = await this.repository.completeSession(doctorId, sessionId, notes);

            if (!completedSession) {
                return {
                    message: "Session not found",
                    status: 404
                };
            }

            return {
                message: "Session completed successfully",
                session: completedSession,
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error completing session",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Get all sessions for a doctor
    async getDoctorSessions(doctorId, status) {
        try {
            const sessions = await this.repository.fetchDoctorSessions(doctorId, status);

            return {
                message: "Sessions retrieved successfully",
                sessions,
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error retrieving sessions",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Get a specific session
    async getSessionById(doctorId, sessionId) {
        try {
            const session = await this.repository.fetchSessionById(doctorId, sessionId);

            return {
                message: "Session retrieved successfully",
                session,
                status: 200
            };
        } catch (err) {
            if (err.message === "Session not found") {
                return {
                    message: "Session not found",
                    status: 404
                };
            }

            throw new APIError(
                "Error retrieving session",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Get sessions for a specific patient
    async getPatientSessions(doctorId, patientId) {
        try {
            const sessions = await this.repository.fetchSessionsByPatient(doctorId, patientId);

            return {
                message: "Patient sessions retrieved successfully",
                sessions,
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error retrieving patient sessions",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Add or update a degree
    async updateDegree(doctorId, degreeData) {
        try {
            // Validate required fields
            if (!degreeData.degreeName) {
                return {
                    message: "Degree name is required",
                    status: 400
                };
            }

            const doctor = await this.repository.updateDegree(doctorId, degreeData);

            if (!doctor) {
                return {
                    message: "Doctor not found",
                    status: 404
                };
            }

            return {
                message: "Degree updated successfully",
                degrees: doctor.degrees,
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error updating degree",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Remove a degree
    async removeDegree(doctorId, degreeId) {
        try {
            const doctor = await this.repository.removeDegree(doctorId, degreeId);

            if (!doctor) {
                return {
                    message: "Doctor or degree not found",
                    status: 404
                };
            }

            return {
                message: "Degree removed successfully",
                degrees: doctor.degrees,
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error removing degree",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Add or update hospital affiliation
    async updateHospitalAffiliation(doctorId, affiliationData) {
        try {
            // Validate required fields
            if (!affiliationData.name) {
                return {
                    message: "Hospital name is required",
                    status: 400
                };
            }

            const doctor = await this.repository.updateHospitalAffiliation(doctorId, affiliationData);

            if (!doctor) {
                return {
                    message: "Doctor not found",
                    status: 404
                };
            }

            return {
                message: "Hospital affiliation updated successfully",
                hospitalAffiliations: doctor.hospitalAffiliations,
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error updating hospital affiliation",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Remove a hospital affiliation
    async removeHospitalAffiliation(doctorId, affiliationId) {
        try {
            const doctor = await this.repository.removeHospitalAffiliation(doctorId, affiliationId);

            if (!doctor) {
                return {
                    message: "Doctor or hospital affiliation not found",
                    status: 404
                };
            }

            return {
                message: "Hospital affiliation removed successfully",
                hospitalAffiliations: doctor.hospitalAffiliations,
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error removing hospital affiliation",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Update specializations
    async updateSpecializations(doctorId, specializations) {
        try {
            if (!specializations || !Array.isArray(specializations) || specializations.length === 0) {
                return {
                    message: "At least one specialization is required",
                    status: 400
                };
            }

            const doctor = await this.repository.updateSpecializations(doctorId, specializations);

            if (!doctor) {
                return {
                    message: "Doctor not found",
                    status: 404
                };
            }

            return {
                message: "Specializations updated successfully",
                specialization: doctor.specialization,
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error updating specializations",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Update languages
    async updateLanguages(doctorId, languages) {
        try {
            if (!languages || !Array.isArray(languages) || languages.length === 0) {
                return {
                    message: "At least one language is required",
                    status: 400
                };
            }

            const doctor = await this.repository.updateLanguages(doctorId, languages);

            if (!doctor) {
                return {
                    message: "Doctor not found",
                    status: 404
                };
            }

            return {
                message: "Languages updated successfully",
                languages: doctor.languages,
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error updating languages",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Search for doctors
    async searchDoctors(searchParams) {
        try {
            const { name, specialization, language, location, minExperience, maxFee, page, limit } = searchParams;

            const results = await this.repository.searchDoctors({
                name,
                specialization,
                language,
                location,
                minExperience,
                maxFee,
                page,
                limit
            });

            return {
                message: "Search results retrieved successfully",
                results,
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error searching for doctors",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Get all doctors with pagination
    async getAllDoctors(filters) {
        try {
            const doctors = await this.repository.fetchDoctors(filters);

            return {
                message: "Doctors retrieved successfully",
                doctors,
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error retrieving doctors",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }

    // Delete doctor account
    async deleteDoctor(doctorId) {
        try {
            const result = await this.repository.deleteDoctor(doctorId);

            if (result.deletedCount === 0) {
                return {
                    message: "Doctor not found",
                    status: 404
                };
            }

            return {
                message: "Doctor account deleted successfully",
                status: 200
            };
        } catch (err) {
            throw new APIError(
                "Error deleting doctor account",
                STATUS_CODES.INTERNAL_ERROR,
                err.message,
                false,
                err.stack
            );
        }
    }
}