import { Router } from "express";
import { getHotels } from "../../controllers/public/hotel.controller.ts";
const router = Router();

router.post("/", getHotels);

export default router;
