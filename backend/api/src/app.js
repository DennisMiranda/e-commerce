import cors from "cors";
import express from "express";
import categoriesRoutes from "./routes/categories.routes.js";
import productRoutes from "./routes/products.routes.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

// Montar rutas desde archivo externo
app.use(productRoutes);
app.use(categoriesRoutes);

app.listen(port, () => {
  console.log(`Servidor Express activo en http://localhost:${port}`);
});
