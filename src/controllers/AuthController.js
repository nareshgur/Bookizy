// routes/AuthController.js
const express = require('express')
const router = express.Router()
const { register, login } = require('../services/AuthServices')
const logger = require('../utils/logger')
router.post("/register", async (req, res) => {
  try {
    console.log("The data received in Auth Controller ", req.body);
    const result = await register(req.body)
    logger.info("User registration successful", { email: req.body.email });
    return res.status(result.status).json(result)
  } catch (ex) {
    console.error("Error in registering", ex);
    logger.error("User registration failed", { error: ex.message });
    return res.status(500).json({ status: 500, message: "Internal Server Error" })
  }
})

router.post("/login", async (req, res) => {
  try {
    console.log("The data received to the login controller ", req.body);
    const result = await login(req.body)
    // result has structured { status, message, data? }
    if (result.status >= 400) {
      logger.error("User login failed", { error: result.message });
      return res.status(result.status).json(result)
    }
    logger.info("User login successful", { email: req.body.email });
    // set auth header and return token + safe user
    res.header('x-auth-header', result.data.token)
    return res.status(result.status).json(result)
  } catch (err) {

    logger.info("User login encountered an error", { error: err.message });
    console.error("Something went wrong in the login controller ", err);
    return res.status(500).json({ status: 500, message: "Internal server error" })
  }
})

module.exports = router
