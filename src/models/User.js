// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, unique: true },
  phone: { type: String, required: true, unique: true },
  Password: { type: String, required: true }, // hashed
}, { timestamps: true });

// remove password from returned objects
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.Password;
  return obj;
};

module.exports = mongoose.model("User", UserSchema);
