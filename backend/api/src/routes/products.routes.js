import express from "express";
import multer from "multer";
import path from "path";

import {
  createProduct,
  getProducts,
} from "../controllers/products.controller.js";

const router = express.Router();

// Configurar multer para guardar imágenes en /uploads
const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage });

// GET: Obtener productos con búsqueda opcional
router.get("/products", getProducts);
// POST: agregar producto con imagen
router.post("/products", upload.single("product-image"), createProduct);

export default router;
