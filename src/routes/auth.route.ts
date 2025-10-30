import { Router } from "express";
import { login } from "../controllers/auth/login.controller.ts";
import { signup } from "../controllers/auth/signup.controller.ts";
import { logout } from "../controllers/auth/logout.controller.ts";
import { token } from "../controllers/auth/token.controller.ts";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/token", token);

export default router;
