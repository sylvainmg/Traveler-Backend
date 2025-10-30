import { Router } from "express";
import { root } from "../controllers/admin/root.controller.ts";

const router = Router();

router.get("/", root);

export default router;
