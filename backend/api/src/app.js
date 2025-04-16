import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { getConnection } from "./database/connection.js";

const app = express();
const port = 3000;

// Configurar multer para guardar imágenes en /uploads
const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage });

app.use(cors());
app.use(express.static("public")); // para servir las imágenes si es necesario

// GET: obtener productos
app.get("/products", async (req, res) => {
  const dbConnection = await getConnection();
  const result = await dbConnection.request().query("SELECT * FROM products");
  res.send(result.recordset);
});

// POST: agregar producto (con imagen)
app.post("/products", upload.single("product-image"), async (req, res) => {
  try {
    const {
      "product-name": name,
      "product-brand": brand,
      "product-description": description,
      "product-price": price,
      "product-stock": stock,
      "select-category": category,
      "product-status": status,
    } = req.body;

    const image = req.file.filename;

    const db = await getConnection();
    await db
      .request()
      .input("name", name)
      .input("brand", brand)
      .input("description", description)
      .input("price", price)
      .input("stock", stock)
      .input("category", category)
      .input("status", status)
      .input("image", image).query(`
        INSERT INTO products (name, brand, description, price, stock, category, status, image)
        VALUES (@name, @brand, @description, @price, @stock, @category, @status, @image)
      `);

    res
      .status(200)
      .json({ success: true, message: "Producto guardado correctamente" });
  } catch (err) {
    console.error("Error al guardar producto:", err);
    res.status(500).json({
      success: false,
      message: "Error al guardar producto",
      error: err.toString(),
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor Express activo en http://localhost:${port}`);
});
