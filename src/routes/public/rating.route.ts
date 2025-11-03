import { Router } from "express";
import { createRating } from "../../controllers/public/rating.controller.ts";
const router = Router();

router.post("/", createRating);

export default router;
