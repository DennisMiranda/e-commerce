import { getConnection } from "../database/connection.js";

export const getOrders = async (req, res) => {
  const userData = req.tokenData;

  const dbConnection = await getConnection();
  const result = await dbConnection.request().input("userId", userData.id)
    .query(`SELECT 
    po.id, 
    po.create_date, 
    po.total,
    po.status,
    p.id as productId,
    pod.quantity,
    pod.sell_price,
    p.name,
    p.description,
    p.image
    FROM purchase_order as po 
    inner join purchase_order_details as pod
    ON po.id = pod.purchase_order_id
    inner join products as p
    ON pod.products_id =p.id 
    WHERE po.users_id=@userId`);

  res.send({ data: result.recordset });
};

const createOrder = async (req, res) => {
  const userData = req.tokenData;
  const { products, total } = req.body;
  const dbConnection = await getConnection();
  try {
    await dbConnection.transaction(async (transaction) => {
      const orderResult = await transaction
        .request()
        .input("userId", userData.id)
        .input("total", total)
        .query(`INSERT INTO purchase_order (users_id, create_date, total, status) 
        OUTPUT INSERTED.id 
        VALUES (@userId, GETDATE(), @total, 'pending')`);

      const orderId = orderResult.recordset[0].id;

      for (const product of products) {
        await transaction
          .request()
          .input("orderId", orderId)
          .input("productId", product.id)
          .input("quantity", product.quantity)
          .input("sellPrice", product.sell_price)
          .query(`INSERT INTO purchase_order_details (purchase_order_id, products_id, quantity, sell_price) 
          VALUES (@orderId, @productId, @quantity, @sellPrice)`);
      }
    });
    res.status(201).send({ message: "Order created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error creating order" });
  }
};
