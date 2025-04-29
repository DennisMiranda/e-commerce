import { getConnection } from "../database/connection.js";
import { decryptToken } from "./auth.controller.js";

export const getOrders = async (req, res) => {
  const token = req.headers["authorization"];
  const userData = decryptToken(token);

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
