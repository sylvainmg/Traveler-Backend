import { Router } from "express";
import {
    getBookings,
    getBookingsNumber,
    getBookingsStats,
} from "../controllers/bookings/bookings.controller.ts";

const router = Router();

router.post("/", getBookings);
router.get("/", getBookingsNumber);
router.post("/stats", getBookingsStats);

export default router;
