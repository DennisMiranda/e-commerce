import express from "express";
import { getOrders } from "../controllers/orders.controller.js";

const router = express.Router();

// GET: Obtener ordenes de compra
router.get("/app/orders", getOrders);

export default router;
