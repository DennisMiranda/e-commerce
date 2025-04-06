import sql from "mssql";
import env from "dotenv";
env.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: +process.env.DB_PORT,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export const getConnection = async () => {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch (error) {
    console.error(error);
  }
};
