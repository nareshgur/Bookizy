const winston = require("winston");
const mongoose = require("mongoose");

module.exports = function () {
  const db =
    process.env.db ||
    "mongodb+srv://nareshgurrala37:Ggsh%405502!.@cluster0.1xhzokj.mongodb.net/BookMyShow";
  mongoose
    .connect(db)
    .then(() => {
      winston.info(`Connected to ${db}`);
      console.log("Mongoose connected to:", mongoose.connection.host);
      console.log("Database name:", mongoose.connection.db.databaseName);
      console.log("Full URI from env:", process.env.MONGO_URI);
    })
    .catch((err) => winston.error("Could not connect because of ", err));
};
