import { Router } from "express";
import {
    getClientBookings,
    getClient,
} from "../../controllers/public/client.controller.ts";
const router = Router();

router.post("/", getClientBookings);
router.post("/info", getClient);

export default router;
