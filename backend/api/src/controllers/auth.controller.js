import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getConnection } from "../database/connection.js";
import env from "dotenv";
env.config();

export const decryptToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    console.error("Error al verificar el token:", err);
    return null;
  }
};

//Es una petición POST - REGISTER
export const register = async (req, res) => {
  const { name, lastname, email, password } = req.body;
  const dbConnection = await getConnection();
  //encripta el password que se manda en el cuerpo de la solitud, lo encripta en 10 caracteres
  const hashed = await bcrypt.hash(password, 10);

  try {
    const result = await dbConnection
      .request()
      .input("name", name)
      .input("lastname", lastname)
      .input("email", email)
      .input("password", hashed).query(`
    INSERT INTO Users (name, lastname, email, password)
    VALUES (@name, @lastname, @email, @password)`);

    res.status(201).json({ message: "Registro exitoso" });
  } catch (err) {
    console.log(err);

    res
      .status(500)
      .json({ message: "Error al registrar", error: err.toString() });
  }
};

// Se podria validar si el usuario ya existe para mandar otro mensaje
// try recupera un objeto

export const login = async (req, res) => {
  const { email, password } = req.body;
  const dbConnection = await getConnection();

  try {
    const result = await dbConnection.query`
    SELECT * FROM Users WHERE email =${email}`;

    const user = result.recordset[0];
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    //constrastar contraseña ingresada vs la de la bd
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // solo HTTPS
      sameSite: "Lax",
      path: "/",
      maxAge: 3600000, // 1h
    });

    user.password = undefined; // Eliminar la contraseña del objeto de usuario

    res.json({ user, token });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al iniciar sesión", error: err.toString() });
  }
};

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const dbConnection = await getConnection();

  try {
    const result = await dbConnection.query`
    SELECT * FROM Admin WHERE email =${email}`;

    const user = result.recordset[0];
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    //constrastar contraseña ingresada vs la de la bd
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // solo HTTPS
      sameSite: "Lax",
      path: "/",
      maxAge: 3600000, // 1h
    });

    user.password = undefined; // Eliminar la contraseña del objeto de usuario

    res.json({ user, token });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al iniciar sesión", error: err.toString() });
  }
};

//Cerrar Sesion
export const logout = (req, res) => {
  // Elimina la cookie llamada "token"
  res.clearCookie("token", {
    httpOnly: true,
    secure: true, // true si estás en https
    sameSite: "strict", // o "lax", según cómo configuraste la cookie
  });

  res.status(200).json({ message: "Sesión cerrada correctamente" });
};
