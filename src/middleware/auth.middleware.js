import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    req.userId = decoded.id; 

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};