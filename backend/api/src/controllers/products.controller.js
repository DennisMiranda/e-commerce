import multer from "multer";
import { getConnection } from "../database/connection.js";
import { getMulterStorage } from "../utils/multer.utils.js";
import cloudinary from "cloudinary"; // Importar Cloudinary

// Configura Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class ProductsController {
  constructor() {
    this.dbConnection = null;

    this.connect();
  }

  async connect() {
    this.dbConnection = await getConnection();
  }

  /**
   * Busca productos por id o por nombre //Actualizado Permite combinar múltiples filtros (id, name, status)
   */
  async searchProducts({ id, name, status }) {
    let query = `
      SELECT p.id, p.name, p.description, p.status, p.price, p.stock, p.image, p.categories_id,
             c.name as category, b.name as brand
      FROM products AS p
      INNER JOIN categories AS c ON p.categories_id = c.id
      INNER JOIN brands AS b ON p.brands_id = b.id
      WHERE 1=1
    `;

    const request = this.dbConnection.request();

    if (id) {
      query += ` AND p.id = @id`;
      request.input("id", id);
    }

    if (name) {
      query += ` AND (
        p.name LIKE '%' + @name + '%'
        OR p.description LIKE '%' + @name + '%'
        OR c.name LIKE '%' + @name + '%'
        OR b.name LIKE '%' + @name + '%'
      )`;
      request.input("name", name);
    }

    if (status !== undefined) {
      query += ` AND p.status = @status`;
      request.input("status", status);
    }

    const result = await request.query(query);
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

  getProductsApp = async (req, res) => {
    try {
      const { search } = req.query;

      const productos = await this.searchProducts({ name: search, status: 1 });
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

      await this.dbConnection
        .request()
        .input("id", productId)
        .input("name", productData.name)
        .input("description", productData.description)
        .input("status", productData.status)
        .input("price", productData.price)
        .input("stock", productData.stock)
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

  //IMAGEN EN CLOUDINARY
  // Modificado: Subir la imagen a Cloudinary y actualizar la URL en la base de datos
  updateProductImage = async (req, res) => {
    const productId = req.params.id;

    try {
      // Subir imagen a Cloudinary
      const file = req.file; // El archivo que se sube
      if (!file) {
        return res.status(400).json({ message: "No image file provided." });
      }

      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      const cloudinaryResult = await cloudinary.v2.uploader.upload(dataURI, {
        public_id: `product_${productId}`, // Usar el ID del producto para el nombre de la imagen
        asset_folder: "products", // Puedes configurar una carpeta específica para productos
      });

      // Obtener la URL de la imagen subida
      const imageUrl = cloudinaryResult.secure_url;

      console.log(cloudinaryResult);

      // Actualizar la URL de la imagen en la base de datos
      await this.dbConnection
        .request()
        .input("id", productId)
        .input("image", imageUrl)
        .query(`UPDATE products SET image=@image WHERE id=@id`);

      res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        data: { image: imageUrl }, // Devuelves la URL de la imagen
      });
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      res.status(500).json({
        success: false,
        message: "Error uploading image to Cloudinary",
        error: error.toString(),
      });
    }
  };

  //Top 6 productos nuevos
  getTopNewProductsApp = async (req, res) => {
    try {
      const productos = await this.dbConnection.request().query(
        `SELECT TOP 6 p.id, p.name, p.description, p.status, p.price, p.stock, p.image, p.categories_id,
          c.name as category, b.name as brand
          FROM products AS p
          INNER JOIN categories AS c ON p.categories_id = c.id
          INNER JOIN brands AS b ON p.brands_id = b.id
          WHERE p.status = 1
          ORDER BY p.create_date DESC`
      );
      res.send(productos.recordset);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      res.status(500).json({ error: "Error al obtener productos" });
    }
  };
}

export default ProductsController;
