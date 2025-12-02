// routes/AuthController.js
const express = require('express')
const router = express.Router()
const { register, login } = require('../services/AuthServices')

router.post("/register", async (req, res) => {
  try {
    console.log("The data received in Auth Controller ", req.body);
    const result = await register(req.body)
    return res.status(result.status).json(result)
  } catch (ex) {
    console.error("Error in registering", ex);
    return res.status(500).json({ status: 500, message: "Internal Server Error" })
  }
})

router.post("/login", async (req, res) => {
  try {
    console.log("The data received to the login controller ", req.body);
    const result = await login(req.body)
    // result has structured { status, message, data? }
    if (result.status >= 400) {
      return res.status(result.status).json(result)
    }
    // set auth header and return token + safe user
    res.header('x-auth-header', result.data.token)
    return res.status(result.status).json(result)
  } catch (err) {
    console.error("Something went wrong in the login controller ", err);
    return res.status(500).json({ status: 500, message: "Internal server error" })
  }
})

module.exports = router
