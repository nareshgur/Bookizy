const Seat = require("../models/Seat");



exports.createSeat = async(data)=>{
    const result = await Seat.create(data)

    return {status:200,data:{message:"Succesfully created the Seat",data:result}}
}


exports.createManySeats = async (data)=>{
    const result = await Seat.insertMany(data)
    return {status:200,data:{message:"Succesfully inserted the seats",data:result}}
}


exports.getSeatsByScreen = async(screenId)=>{
    const result = await Seat.find({screenId:screenId}).sort({row:1,col:1})
    return {status:200,data:{data:result}}
}