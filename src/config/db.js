const winston = require("winston");
const mongoose = require("mongoose");

module.exports = function () {
  const db =
    process.env.db ||
    "mongodb+srv://nareshgurrala37:Ggsh%405502!.@cluster0.1xhzokj.mongodb.net/BookMyShow";
  
  const mongooseOptions = {
    retryWrites: true,
    w: "majority",
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
  };

  console.log("🔄 Attempting to connect to MongoDB...");
  console.log("Database URI:", db.replace(/:[^:]*@/, ":****@")); // Hide password
  
  mongoose
    .connect(db, mongooseOptions)
    .then(() => {
      console.log("✅ MONGOOSE CONNECTED SUCCESSFULLY");
      console.log("Connected to:", mongoose.connection.host);
      console.log("Database name:", mongoose.connection.db.databaseName);
      winston.info(`Connected to ${db}`);
    })
    .catch((err) => {
      console.error("❌ MONGODB CONNECTION FAILED");
      console.error("Error:", err.message);
      console.error("\nTroubleshooting steps:");
      console.error("1. Check network connectivity: Test-NetConnection -ComputerName cluster0.1xhzokj.mongodb.net -Port 27017");
      console.error("2. Verify MongoDB Atlas IP whitelist includes your IP");
      console.error("3. Check firewall/VPN settings");
      console.error("4. Verify database credentials are correct");
      winston.error("Could not connect because of " + err.message);
    });
};
