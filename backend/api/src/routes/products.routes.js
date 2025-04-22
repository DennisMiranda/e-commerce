import express from "express";
import multer from "multer";
import ProductsController from "../controllers/products.controller.js";
import { getMulterStorage } from "../utils/multer.utils.js";

const router = express.Router();
const productController = new ProductsController();

const upload = multer({ storage: getMulterStorage() });

// GET: Obtener productos con búsqueda opcional
router.get("/products", productController.getProducts);
// POST: agregar producto con imagen
router.post("/products", productController.createProduct);
router.put("/products/:id", productController.updateProduct);
router.post(
  "/products/:id/image",
  upload.single("product-image"),
  productController.updateProductImage
);

export default router;
