import { getConnection } from "../database/connection.js";

export const getCategories = async (req, res) => {
  const dbConnection = await getConnection();
  const result = await dbConnection.request().query("SELECT * FROM categories");

  res.send(result.recordset);
};
