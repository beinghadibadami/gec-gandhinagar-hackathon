import DoctorService from "../services/doctor-service.js";
import protect from "../middlewares/protect.js";
import { upload } from "../utils/multer.js";

const doctor = (app) => {
    const service = new DoctorService();

    // Registration and authentication routes
    app.post("/api/v1/doctor/register", async (req, res, next) => {
        try {
            const { status, ...rest } = await service.registerDoctor(req.body);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.post("/api/v1/doctor/login", async (req, res, next) => {
        try {
            const { status, ...rest } = await service.loginDoctor(req.body);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.get("/api/v1/doctor/verify/:token", async (req, res, next) => {
        try {
            const token = req.params.token;
            const { status, ...rest } = await service.verifyDoctorEmail(req, token);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.post("/api/v1/doctor/forgot-password", async (req, res, next) => {
        try {
            const { status, ...rest } = await service.forgotPasswordRequest(req.body);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.post("/api/v1/doctor/reset-password/:token", async (req, res, next) => {
        try {
            const token = req.params.token;
            const { status, ...rest } = await service.resetPassword(req, token, req.body);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    // Protected routes (require authentication)
    app.get("/api/v1/doctor/me", protect, async (req, res, next) => {
        try {
            const { status, ...rest } = await service.getDoctorAuth(req.user);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.get("/api/v1/doctor/profile", protect, async (req, res, next) => {
        try {
            const { status, ...rest } = await service.getDoctorProfile(req.user.doctorId);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.post("/api/v1/doctor/profile", protect, upload.single("profileImage"), async (req, res, next) => {
        try {
            // If file was uploaded, add the path to the request body
            if (req.file) {
                req.body.profileImageUrl = req.file.path;
            }

            const { status, ...rest } = await service.updateDoctorProfile(req.user.doctorId, req.body);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.post("/api/v1/doctor/change-password", protect, async (req, res, next) => {
        try {
            const { status, ...rest } = await service.changePassword(req, req.body);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    // Availability and time slots
    app.post("/api/v1/doctor/availability", protect, async (req, res, next) => {
        try {
            const { status, ...rest } = await service.updateAvailability(req.user.doctorId, req.body);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.put("/api/v1/doctor/availability/:slotId", protect, async (req, res, next) => {
        try {
            const { status, ...rest } = await service.updateTimeSlot(req.user.doctorId, req.params.slotId, req.body);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.delete("/api/v1/doctor/availability/:slotId", protect, async (req, res, next) => {
        try {
            const { status, ...rest } = await service.removeTimeSlot(req.user.doctorId, req.params.slotId);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    // Sessions management
    app.post("/api/v1/doctor/sessions", protect, async (req, res, next) => {
        try {
            const { status, ...rest } = await service.bookSession(req.user.doctorId, req.body);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.get("/api/v1/doctor/sessions", protect, async (req, res, next) => {
        try {
            const { status, ...rest } = await service.getDoctorSessions(req.user.doctorId, req.query.status);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.get("/api/v1/doctor/sessions/:sessionId", protect, async (req, res, next) => {
        try {
            const { status, ...rest } = await service.getSessionById(req.user.doctorId, req.params.sessionId);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.get("/api/v1/doctor/patient-sessions/:patientId", protect, async (req, res, next) => {
        try {
            const { status, ...rest } = await service.getPatientSessions(req.user.doctorId, req.params.patientId);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.put("/api/v1/doctor/sessions/:sessionId", protect, async (req, res, next) => {
        try {
            const { status, ...rest } = await service.updateSession(req.user.doctorId, req.params.sessionId, req.body);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.put("/api/v1/doctor/sessions/:sessionId/cancel", protect, async (req, res, next) => {
        try {
            const { status, ...rest } = await service.cancelSession(req.user.doctorId, req.params.sessionId);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.put("/api/v1/doctor/sessions/:sessionId/complete", protect, async (req, res, next) => {
        try {
            const { status, ...rest } = await service.completeSession(req.user.doctorId, req.params.sessionId, req.body.notes);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    // Professional information management
    app.post("/api/v1/doctor/degrees", protect, async (req, res, next) => {
        try {
            const { status, ...rest } = await service.updateDegree(req.user.doctorId, req.body);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.delete("/api/v1/doctor/degrees/:degreeId", protect, async (req, res, next) => {
        try {
            const { status, ...rest } = await service.removeDegree(req.user.doctorId, req.params.degreeId);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.post("/api/v1/doctor/hospital-affiliations", protect, async (req, res, next) => {
        try {
            const { status, ...rest } = await service.updateHospitalAffiliation(req.user.doctorId, req.body);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.delete("/api/v1/doctor/hospital-affiliations/:affiliationId", protect, async (req, res, next) => {
        try {
            const { status, ...rest } = await service.removeHospitalAffiliation(req.user.doctorId, req.params.affiliationId);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.put("/api/v1/doctor/specializations", protect, async (req, res, next) => {
        try {
            const { status, ...rest } = await service.updateSpecializations(req.user.doctorId, req.body);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.put("/api/v1/doctor/languages", protect, async (req, res, next) => {
        try {
            const { status, ...rest } = await service.updateLanguages(req.user.doctorId, req.body);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    // Public routes for searching doctors
    app.post("/api/v1/doctor/search", async (req, res, next) => {
        try {
            const { status, ...rest } = await service.searchDoctors(req.body);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    app.get("/api/v1/doctors", async (req, res, next) => {
        try {
            const { status, ...rest } = await service.getAllDoctors(req.query);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });

    // Account deletion (could require admin privileges or additional verification)
    app.delete("/api/v1/doctor/account", protect, async (req, res, next) => {
        try {
            const { status, ...rest } = await service.deleteDoctor(req.user.doctorId);
            return res.status(status).json({ ...rest });
        } catch (err) {
            next(err);
        }
    });
};

export default doctor;