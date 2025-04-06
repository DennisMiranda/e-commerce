import express from "express";
import { getConnection } from "./database/connection.js";

const app = express();
const port = 3000;

app.get("/products", async (req, res) => {
  const dbConnection = await getConnection();

  const result = await dbConnection.request().query("SELECT * FROM products");

  res.send(result.recordset);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
