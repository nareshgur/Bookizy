const Seat = require("../models/Seat");
const mongoose = require("mongoose");

exports.createSeat = async(data)=>{
    const result = await Seat.create(data)

    return {status:200,data:{message:"Succesfully created the Seat",data:result}}
}


exports.createManySeats = async (data)=>{
    try {
        console.log("=== SeatService.createManySeats START ===");
        console.log("MongoDB connection state:", mongoose.connection.readyState); // 0=disconnected, 1=connected
        console.log("MongoDB database:", mongoose.connection.db?.databaseName);
        console.log("Inserting", data.length, "seats...");
        
        // Insert with explicit options
        const result = await Seat.insertMany(data, { 
            ordered: false,
            writeConcern: { w: "majority", j: true, wtimeout: 5000 }
        });
        
        console.log(`✓ insertMany returned ${result.length} documents with IDs:`, result.map(r => r._id));
        
        // Immediately verify insertion
        const countAfterInsert = await Seat.countDocuments();
        console.log(`✓ Total seats in collection after insert: ${countAfterInsert}`);
        
        // Query the specific screenId
        const verifyInserted = await Seat.find({ screenId: data[0].screenId }).lean();
        console.log(`✓ Verified inserted records for screenId: ${verifyInserted.length} found`);
        
        console.log("=== SeatService.createManySeats END ===");
        
        return {
            status: 200,
            data: {
                message: "Successfully inserted the seats",
                data: result,
                verification: {
                    totalCount: countAfterInsert,
                    insertedForScreen: verifyInserted.length
                }
            }
        };
    } catch (error) {
        console.error("❌ SeatService Error:", error.message);
        console.error("Stack:", error.stack);
        throw error;
    }
}


exports.getSeatsByScreen = async(screenId)=>{
    const result = await Seat.find({screenId:screenId}).sort({row:1,col:1})
    return {status:200,data:{data:result}}
}