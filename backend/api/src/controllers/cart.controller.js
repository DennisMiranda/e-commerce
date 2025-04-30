import { getConnection } from "../database/connection.js";

export const getCart = async (req, res) => {
  const userData = req.tokenData;

  const dbConnection = await getConnection();
  const result = await dbConnection.request().input("userId", userData.id)
    .query(`SELECT 
    p.id as productId,
    sc.quantity,
    p.price,
    p.name,
    p.description,
    p.image
    FROM shopping_cart as sc
    inner join products as p
    ON sc.products_id = p.id 
    WHERE sc.user_id=@userId`);

  res.send({ data: result.recordset });
};

export const addProductToCart = async (req, res) => {
  const userData = req.tokenData;
  console.log(req.body, req.headers, userData);
  const { productId, quantity } = req.body;

  const dbConnection = await getConnection();
  try {
    await dbConnection
      .request()
      .input("userId", userData.id)
      .input("productId", productId)
      .input("quantity", quantity)
      .query(`INSERT INTO shopping_cart (user_id, products_id, quantity) 
          VALUES (@userId, @productId, @quantity)`);
    res.status(201).send({ message: "Product added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error creating order" });
  }
};
