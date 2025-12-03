const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: "Access denied. No token provided."
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user data to request object
    next();
  } catch (err) {
    console.log("JWT Error:", err.name);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: 401,
        message: "Token expired. Please login again."
      });
    }

    return res.status(400).json({
      status: 400,
      message: "Invalid token."
    });
  }
};
