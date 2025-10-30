import { Router } from "express";
import {
    getClients,
    getClientsNumber,
    getTopClients,
} from "../controllers/clients/clients.controller.ts";

const router = Router();

router.post("/", getClients);
router.get("/", getClientsNumber);
router.get("/top", getTopClients);

export default router;
