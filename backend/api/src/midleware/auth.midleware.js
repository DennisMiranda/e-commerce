import { decryptToken } from "../controllers/auth.controller.js";
//Revisar si el request del admin tiene el token activo y correspondiente a su rol.

export const checkToken = (req, res, next) => {
  const token = req.headers["authorization"];
  const tokenData = decryptToken(token);
  if (tokenData) {
    console.log("Token:", tokenData);
    req.tokenData = tokenData;
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
};
