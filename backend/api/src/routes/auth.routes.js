import express from "express";

//permite ocultar rutas al usuario, por temas de seguridad
const router = express.Router();

import { register, login, loginAdmin } from "../controllers/auth.controller.js";

router.post("/register", register);
router.post("/login", login);
router.post("/admin/login", loginAdmin);

export default router;
