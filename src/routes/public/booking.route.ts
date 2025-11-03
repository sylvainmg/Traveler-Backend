import { Router } from "express";
import {
    createBooking,
    getBookings,
} from "../../controllers/public/booking.controller.ts";
const router = Router();

router.post("/", getBookings);
router.post("/add", createBooking);

export default router;
