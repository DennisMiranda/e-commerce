//Revisar si el request del admin tiene el token activo y correspondiente a su rol.

export const checkToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (token) {
    console.log("Token:", token);
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
};
