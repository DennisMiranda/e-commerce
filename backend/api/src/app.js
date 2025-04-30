import cors from "cors";
import express from "express";
import categoriesRoutes from "./routes/categories.routes.js";
import productRoutes from "./routes/products.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cartRoutes from "./routes/cart.routes.js";

const app = express();
const port = 3000;
const allowedOrigins = ["http://localhost:4321", "http://localhost:4322"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, origin); // Permitir el origen
      } else {
        callback(new Error("No permitido por CORS")); // Bloquear el origen
      }
    },
    credentials: true, //  permite cookies
  })
);
app.use(express.static("public"));
app.use(express.json());

// Montar rutas desde archivo externo
app.use(productRoutes);
app.use(categoriesRoutes);
app.use(ordersRoutes);
app.use(cartRoutes);
app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log(`Servidor Express activo en http://localhost:${port}`);
});
