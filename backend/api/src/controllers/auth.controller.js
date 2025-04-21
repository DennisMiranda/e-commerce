import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getConnection } from "../database/connection.js";
import env from "dotenv";
env.config();

//Es una petición POST - req=request
export const register = async (req, res) => {
  const { email, password } = req.body;
  const dbConnection = await getConnection();
  //encripta el password que se manda en el cuerpo de la solitud, lo encripta en 10 caracteres
  const hashed = await bcrypt.hash(password, 10);

  try {
    const result = await dbConnection.query`
    INSERT INTO Users (email,password)
    VALUES (${email}, ${hashed})`;

    res.status(201).json({ message: "Registro exitoso" });
  } catch (err) {
    res.status(500).json({ message: "Error al registrar" });
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

    res.json({ token });
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
