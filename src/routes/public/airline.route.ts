import { Router } from "express";
import { getAirlines } from "../../controllers/public/airline.controller.ts";
const router = Router();

router.get("/", getAirlines);

export default router;
