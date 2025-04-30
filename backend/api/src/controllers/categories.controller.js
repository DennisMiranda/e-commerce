import { getConnection } from "../database/connection.js";

export const getCategories = async (req, res) => {
  const dbConnection = await getConnection();
  const query = `
    SELECT c.id, c.name, p.id AS product_id, p.name AS product_name, p.price, p.stock
    FROM categories c
    LEFT JOIN products p ON p.categories_id = c.id
  `;
  const result = await dbConnection.request().query(query);

  const categories = result.recordset.reduce((acc, row) => {
    const category = acc.find((cat) => cat.id === row.id);
    if (!category) {
      acc.push({
        id: row.id,
        name: row.name,
        products: row.product_id
          ? [
              {
                id: row.product_id,
                name: row.product_name,
                price: row.price,
                stock: row.stock,
              },
            ]
          : [],
      });
    } else {
      if (row.product_id) {
        category.products.push({
          id: row.product_id,
          name: row.product_name,
          price: row.price,
          stock: row.stock,
        });
      }
    }
    return acc;
  }, []);

  res.send(categories); // Enviar las categorías con productos
  console.log(categories);
};
