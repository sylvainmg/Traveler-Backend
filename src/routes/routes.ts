import { Router } from "express";
import authRoutes from "../routes/auth.route.ts";
import clientsRoutes from "../routes/clients.route.ts";
import airlinesRoutes from "../routes/airlines.route.ts";
import hotelsRoutes from "../routes/hotels.route.ts";
import adminsRoutes from "../routes/admin.route.ts";
import bookingsRoutes from "../routes/bookings.route.ts";
import rootRoute from "./root.route.ts";
import {
    verifyAccessToken,
    verifyAdminAccessToken,
} from "../middlewares/accessToken.middleware.ts";
import publicBookingRoutes from "../routes/public/booking.route.ts";
import publicHotelsRoutes from "../routes/public/hotels.route.ts";
import publicAirlinesRoutes from "../routes/public/airline.route.ts";
import publicRatingRoute from "../routes/public/rating.route.ts";
import publicClientRoute from "../routes/public/client.route.ts";

const router = Router();

// Auths
router.use("/admin/root", verifyAdminAccessToken, rootRoute);
router.use("/admin/auth", adminsRoutes); // admin
router.use("/auth", authRoutes); // client

// admins routes
router.use("/admin/clients", verifyAdminAccessToken, clientsRoutes);
router.use("/admin/airlines", verifyAdminAccessToken, airlinesRoutes);
router.use("/admin/hotels", verifyAdminAccessToken, hotelsRoutes);
router.use("/admin/bookings", verifyAdminAccessToken, bookingsRoutes);

// clients routes
router.use("/bookings", verifyAccessToken, publicBookingRoutes);
router.use("/hotels", verifyAccessToken, publicHotelsRoutes);
router.use("/airlines", verifyAccessToken, publicAirlinesRoutes);
router.use("/rating", verifyAccessToken, publicRatingRoute);
router.use("/client", verifyAccessToken, publicClientRoute);

export default router;
