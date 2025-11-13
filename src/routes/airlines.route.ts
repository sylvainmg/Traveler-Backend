import { Router } from "express";
import {
    getAirlines,
    getAirlinesNumber,
    getAirlinesRating,
    getTopAirlines,
    getTopDestinations,
    updateAirline,
} from "../controllers/partners/compagnie_aerienne.controller.ts";
import addAirline from "../controllers/partners/addAirline.controller.ts";

const router = Router();

router.post("/", getAirlines);
router.put("/", updateAirline);
router.get("/", getAirlinesNumber);
router.get("/topDest", getTopDestinations);
router.get("/topAir", getTopAirlines);
router.post("/rating", getAirlinesRating);
router.post("/add", addAirline);

export default router;
