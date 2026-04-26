import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Token check
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Bearer token extract
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Save user info in request
    req.user = decoded;

    next(); // move to next step
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};