import { Router } from "express";
import { getAirlines } from "../../controllers/public/airline.controller.ts";
import { getAirlinesRating } from "../../controllers/partners/compagnie_aerienne.controller.ts";
const router = Router();

router.get("/", getAirlines);
router.post("/rating", getAirlinesRating);

export default router;
