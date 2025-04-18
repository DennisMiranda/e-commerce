import { getConnection } from "../database/connection.js";

const searchProducts = async ({ id, name }) => {
  const dbConnection = await getConnection();

  let query = `SELECT p.id, p.name, p.description, p.status, p.price, p.stock, p.image,
                c.name as category, b.name as brand
                FROM products AS p
                INNER JOIN categories AS c ON p.categories_id = c.id
                INNER JOIN brands AS b ON p.brands_id = b.id
                `;
  if (id) {
    query += ` WHERE p.id = ${id}`;
  } else if (name) {
    const sanitizedSearch = name.replace(/'/g, "''");
    query += ` WHERE p.id LIKE '%${sanitizedSearch}%'
                OR p.name LIKE '%${sanitizedSearch}%'
                OR p.description LIKE '%${sanitizedSearch}%'
                OR c.name LIKE '%${sanitizedSearch}%'
                OR b.name LIKE '%${sanitizedSearch}%'`;
  }

  const result = await dbConnection.request().query(query);
  return result.recordset;
};

export const getProducts = async (req, res) => {
  try {
    const { search } = req.query;

    const productos = await searchProducts({ name: search });
    res.send(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

export const createProduct = async (req, res) => {
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

    const resultProductDb = await db
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
        OUTPUT INSERTED.id
        VALUES (@name, @description, @status, @price, @stock, @image,  @categories_id, @brands_id )
      `
      );

    const productId = resultProductDb.recordset[0].id;
    const product = await searchProducts({ id: productId });

    res.status(200).json({
      success: true,
      message: "Producto guardado correctamente",
      data: product[0],
    });
  } catch (err) {
    console.error("Error al guardar producto:", err);
    res.status(500).json({
      success: false,
      message: "Error al guardar producto",
      error: err.toString(),
    });
  }
};
