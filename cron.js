// cron.js
const cron = require("node-cron");
const ShowSeat = require("./src/models/ShowSeat");

cron.schedule("*/10 * * * * *", async () => {
  console.log("⏳ Running seat cleanup cron...");

  const now = new Date();

  try {
    const result = await ShowSeat.updateMany(
      {
        status: "BLOCKED",
        blockedUntil: { $lt: now }
      },
      {
        $set: {
          status: "AVAILABLE",
          blockedAt: null,
          blockedUntil: null
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`✔ Auto-Released ${result.modifiedCount} expired seats`);
    }

  } catch (err) {
    console.error("Cron Error:", err);
  }
});
