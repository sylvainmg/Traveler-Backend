import { Router } from "express";
import { getHotels } from "../../controllers/public/hotel.controller.ts";
import { getHotelsRating } from "../../controllers/partners/hotels.controller.ts";
const router = Router();

router.post("/", getHotels);
router.post("/rating", getHotelsRating);

export default router;
