import express from "express";
import multer from "multer";
import ProductsController from "../controllers/products.controller.js";

const router = express.Router();
const productController = new ProductsController();

// Middleware de Multer para manejo de imágenes
const upload = multer({ storage: multer.memoryStorage() });

// GET: Obtener productos con búsqueda opcional
router.get("/products", productController.getProducts);

// GET: Obtener producto para Ecommerce App
router.get("/app/products", productController.getProductsApp);
// GET: Obtener top 6 de nuevos producto agregados a Ecommerce App
router.get("/app/products/top", productController.getTopNewProductsApp);

// GET: Obtener producto específico por ID
router.get("/products/:id", productController.getProductById);

// POST: agregar producto sin imagen, ya que la imagen la agregaremos en otro endpoint
router.post("/products", productController.createProduct);

// PUT: Actualizar producto
router.put("/products/:id", productController.updateProduct);

// POST: Subir imagen del producto a Cloudinary
router.post(
  "/products/:id/image",
  upload.single("product-image"), // Este middleware maneja la subida de la imagen
  productController.updateProductImage // Aquí actualizas la URL de la imagen en la base de datos
);

export default router;
