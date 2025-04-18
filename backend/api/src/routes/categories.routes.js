import express from "express";
import { getCategories } from "../controllers/categories.controller.js";

const router = express.Router();

// GET: Obtener productos con búsqueda opcional
router.get("/categories", getCategories);

export default router;
