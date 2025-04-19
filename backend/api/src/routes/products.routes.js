import express from "express";
import multer from "multer";
import path from "path";

import ProductsController from "../controllers/products.controller.js";

const router = express.Router();
const productController = new ProductsController();

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
router.get("/products", productController.getProducts);
// POST: agregar producto con imagen
router.post(
  "/products",
  upload.single("product-image"),
  productController.createProduct
);
router.put(
  "/products/:id",
  upload.single("product-image"),
  productController.updateProduct
);

export default router;
