import express from "express";
import { checkToken } from "../midleware/auth.midleware.js";
import { getCart, addProductToCart } from "../controllers/cart.controller.js";

const router = express.Router();

// GET: Obtener ordenes de compra
router.get("/app/cart", checkToken, getCart);
router.post("/app/cart", checkToken, addProductToCart);

export default router;
