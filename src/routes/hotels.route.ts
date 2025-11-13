import { Router } from "express";
import {
    getHotels,
    getHotelsNumber,
    getHotelsRating,
    getTopHotels,
    updateHotel,
} from "../controllers/partners/hotels.controller.ts";
import addHotel from "../controllers/partners/addHotel.controller.ts";

const router = Router();

router.post("/", getHotels);
router.put("/", updateHotel);
router.get("/", getHotelsNumber);
router.get("/topHotels", getTopHotels);
router.post("/rating", getHotelsRating);
router.post("/add", addHotel);

export default router;
