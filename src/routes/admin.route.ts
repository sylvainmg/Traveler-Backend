import { Router } from "express";
import { login } from "../controllers/admin/login.controller.ts";
import { signup } from "../controllers/admin/signup.controller.ts";
import { logout } from "../controllers/admin/logout.controller.ts";
import { token } from "../controllers/admin/token.controller.ts";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.delete("/logout", logout);
router.post("/token", token);

export default router;
