import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getMulterStorage = () => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join("public", "images", req.params.id);
      fs.mkdirSync(dir, { recursive: true }); // Crea la carpeta si no existe
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname); // .jpg, .png, etc.
      cb(null, `${req.params.id}${ext}`);
    },
  });
};

co