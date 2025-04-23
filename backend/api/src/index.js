
import app from "./app.js";

import { getConnection } from "./database/connection.js"; // ajusta la ruta si es distinta

app.get("/ping", async (req, res) => {
    try {
        const pool = await getConnection();
        await pool.request().query("SELECT 1");
        res.send("Conexión exitosa con SQL Server");
    } catch (error) {
        res.status(500).send("Error de conexión con la base de datos");
    }
});
