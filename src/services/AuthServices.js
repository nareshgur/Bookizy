// services/AuthServices.js
const bcrypt = require("bcrypt")
const User = require("../models/User") // adjust path if needed
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken")

// validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,6}$/ // require TLD (like .com/.in)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
// phone: simple 10 digits, optional improvement later
const PHONE_REGEX = /^[6-9]\d{9}$/

exports.register = async (body) => {
  try {
    console.log("The data is received in Auth Service", body);
    const { name, email, phone, Password } = body

    if (!name || !email || !phone || !Password) {
      return { status: 400, message: "name, email, phone and password are required" }
    }

    if (!EMAIL_REGEX.test(email)) {
      return { status: 400, message: "Invalid email format. Please include a valid TLD (e.g. .com, .in)" }
    }

    if (!PHONE_REGEX.test(String(phone))) {
      return { status: 400, message: "Invalid phone number. Provide a 10 digit Indian mobile number." }
    }

    if (!PASSWORD_REGEX.test(Password)) {
      return {
        status: 400,
        message:
          "Password must be minimum 8 characters and include uppercase, lowercase, number and special character."
      }
    }

    console.log("Register: checking user in DB:", mongoose.connection.db.databaseName);

    // check both email & phone uniqueness
    const existing = await User.findOne({ $or: [{ email }, { phone }] })
    if (existing) {
      // be explicit which field conflicts (optional)
      if (existing.email === email) return { status: 409, message: "Email already registered" }
      if (existing.phone === phone) return { status: 409, message: "Phone already registered" }
      return { status: 409, message: "User already exists" }
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(Password, salt)
    const user = new User({
      name,
      email,
      phone,
      Password: hashedPassword
    })

    const saved = await user.save()

    // Do not return password hash
    const safeUser = { _id: saved._id, name: saved.name, email: saved.email, phone: saved.phone }

    return { status: 200, message: "Registered User Successfully", data: { user: safeUser } }
  } catch (err) {
    console.error("AuthService.register error:", err)
    return { status: 500, message: "Internal Server Error" }
  }
}

exports.login = async ({ email, Password }) => {
  try {
    if (!email || !Password) {
      return { status: 400, message: "Email and password are required" }
    }

    if (!EMAIL_REGEX.test(email)) {
      return { status: 400, message: "Invalid email format" }
    }

    const user = await User.findOne({ email: email })
    console.log("Login service got:", email);

    if (!user) {
      // user not found
      return { status: 404, message: "Account does not exist. Please register first." }
    }

    const validPassword = await bcrypt.compare(Password, user.Password)
    if (!validPassword) {
      return { status: 401, message: "Invalid email or password" }
    }

    // sign token (use env var JWT_SECRET)
    const secret = process.env.JWT_SECRET || process.env.jwtPrivateKey
    if (!secret) {
      console.error("JWT secret not set in env!")
      return { status: 500, message: "Server misconfiguration" }
    }

    const payload = { _id: user._id, email: user.email }
    const token = jwt.sign(payload, secret, { expiresIn: "6h" })

    const safeUser = { _id: user._id, name: user.name, email: user.email, phone: user.phone }

    return { status: 200, message: "Login successful", data: { token, user: safeUser } }
  } catch (err) {
    console.error("AuthService.login error:", err)
    return { status: 500, message: "Internal Server Error" }
  }
}
