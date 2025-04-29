import express from "express";
import { getOrders } from "../controllers/orders.controller.js";
import { checkToken } from "../midleware/auth.midleware.js";

const router = express.Router();

// GET: Obtener ordenes de compra
router.get("/app/orders", checkToken, getOrders);

export default router;
