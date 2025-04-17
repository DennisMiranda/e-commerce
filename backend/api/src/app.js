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
app.use(express.static("public"));

// GET: obtener productos para la tabla
app.get("/products", async (req, res) => {
  const dbConnection = await getConnection();
  const result = await dbConnection.request().query("SELECT * FROM products");
  res.send(result.recordset);
});

// POST: agregar producto con imagen
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

    const db = await getConnection();

    // Normalizar la marca
    const formatBrand = (str) => {
      const trimmed = str.trim().toLowerCase();
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    };

    const formattedBrand = formatBrand(brand);

    //Buscar brand en la tabla y crear si no existe
    let resultBrand = await db
      .request()
      .input("brand", formattedBrand.toLowerCase())
      .query("SELECT * FROM brands WHERE LOWER(name)=@brand");

    let brandId;

    // Insertar la marca
    if (!resultBrand.recordset.length) {
      await db
        .request()
        .input("brandName", formattedBrand)
        .query(`INSERT INTO brands(name) VALUES (@brandName)`);

      // Obtener ID de la marca recién insertada
      const newBrandResult = await db
        .request()
        .input("brand", formattedBrand.toLowerCase())
        .query("SELECT id FROM brands WHERE LOWER(name) = @brand");
      brandId = newBrandResult.recordset[0].id;
    } else {
      // Buscar el objeto correcto dentro del recordset
      const brandMatch = resultBrand.recordset.find(
        (b) => b.name.toLowerCase() === formattedBrand.toLowerCase()
      );
      brandId = brandMatch.id;
    }

    const image = req.file.filename;

    await db
      .request()
      .input("name", name)
      .input("description", description)
      .input("status", status)
      .input("price", price)
      .input("stock", stock)
      .input("image", image)
      .input("categories_id", category)
      .input("brands_id", brandId)
      .query(
        `
        INSERT INTO products (name, description, status, price, stock, image, categories_id, brands_id)
        VALUES (@name, @description, @status, @price, @stock, @image,  @categories_id, @brands_id )
      `
      );

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

// GET: obtener categorias
app.get("/categories", async (req, res) => {
  const dbConnection = await getConnection();
  const result = await dbConnection.request().query("SELECT * FROM categories");

  res.send(result.recordset);
});

app.listen(port, () => {
  console.log(`Servidor Express activo en http://localhost:${port}`);
});
