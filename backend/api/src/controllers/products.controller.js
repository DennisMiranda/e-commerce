import multer from "multer";

import { getConnection } from "../database/connection.js";
import { getMulterStorage } from "../utils/multer.utils.js";

class ProductsController {
  constructor() {
    this.dbConnection = null;

    this.connect();
  }

  async connect() {
    this.dbConnection = await getConnection();
  }

  /**
   * Busca productos por id o por nombre
   */
  async searchProducts({ id, name }) {
    let query = `SELECT p.id, p.name, p.description, p.status, p.price, p.stock, p.image, p.categories_id,
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

    const result = await this.dbConnection.request().query(query);
    return result.recordset;
  }

  /**
   * Transforma los datos del formulario a un objeto product.
   */
  parseProduct(data) {
    const {
      "product-name": name,
      "product-brand": brand,
      "product-description": description,
      "product-price": price,
      "product-stock": stock,
      "select-category": category,
      "product-status": status,
    } = data;

    return { name, brand, description, price, stock, category, status };
  }

  // Normalizar la marca
  formatBrand(str) {
    const trimmed = str.trim().toLowerCase();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  getProducts = async (req, res) => {
    try {
      const { search } = req.query;

      const productos = await this.searchProducts({ name: search });
      res.send(productos);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      res.status(500).json({ error: "Error al obtener productos" });
    }
  };

  createProduct = async (req, res) => {
    try {
      const productData = this.parseProduct(req.body);

      const formattedBrand = this.formatBrand(productData.brand);

      //Buscar brand en la tabla y crear si no existe
      let resultBrand = await this.dbConnection
        .request()
        .input("brand", formattedBrand.toLowerCase())
        .query("SELECT * FROM brands WHERE LOWER(name)=@brand");

      let brandId;

      // Insertar la marca
      if (!resultBrand.recordset.length) {
        await this.dbConnection
          .request()
          .input("brandName", formattedBrand)
          .query(`INSERT INTO brands(name) VALUES (@brandName)`);

        // Obtener ID de la marca recién insertada
        const newBrandResult = await this.dbConnection
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

      const resultProductDb = await this.dbConnection
        .request()
        .input("name", productData.name)
        .input("description", productData.description)
        .input("status", productData.status)
        .input("price", productData.price)
        .input("stock", productData.stock)
        .input("image", "")
        .input("categories_id", productData.category)
        .input("brands_id", brandId)
        .query(
          `
        INSERT INTO products (name, description, status, price, stock, image, categories_id, brands_id)
        OUTPUT INSERTED.id
        VALUES (@name, @description, @status, @price, @stock, @image,  @categories_id, @brands_id )
      `
        );

      const productId = resultProductDb.recordset[0].id;
      const product = await this.searchProducts({ id: productId });

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

  /**
   * Actualiza los datos del producto.
   */
  updateProduct = async (req, res) => {
    try {
      const productId = req.params.id;
      const productData = this.parseProduct(req.body);

      const formattedBrand = this.formatBrand(productData.brand);

      //Buscar brand en la tabla y crear si no existe
      let resultBrand = await this.dbConnection
        .request()
        .input("brand", formattedBrand.toLowerCase())
        .query("SELECT * FROM brands WHERE LOWER(name)=@brand");

      let brandId;

      // Insertar la marca
      if (!resultBrand.recordset.length) {
        await this.dbConnection
          .request()
          .input("brandName", formattedBrand)
          .query(`INSERT INTO brands(name) VALUES (@brandName)`);

        // Obtener ID de la marca recién insertada
        const newBrandResult = await this.dbConnection
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

      await this.dbConnection
        .request()
        .input("id", productId)
        .input("name", productData.name)
        .input("description", productData.description)
        .input("status", productData.status)
        .input("price", productData.price)
        .input("stock", productData.stock)
        .input("image", image)
        .input("categories_id", productData.category)
        .input("brands_id", brandId)
        .query(
          `
        UPDATE products SET 
        name=@name, 
        description=@description, 
        status=@status, 
        price=@price, 
        stock=@stock, 
        image=@image, 
        categories_id=@categories_id, 
        brands_id=@brands_id
        WHERE id=@id
      `
        );

      const product = await this.searchProducts({ id: productId });

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

  updateProductImage = async (req, res) => {
    const productId = req.params.id;
    const image = req.file.filename;

    await this.dbConnection
      .request()
      .input("id", productId)
      .input("image", image)
      .query(`UPDATE products SET image=@image WHERE id=@id`);

    res.status(200).json({
      success: true,
      message: "Imagen guardada correctamente",
      data: { image },
    });
  };
}

export default ProductsController;
