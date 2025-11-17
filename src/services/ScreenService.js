const Screen = require("../models/Screen");


exports.CreateScreen = async (data)=>{
  const result =  await Screen.create(data)
    return {status:200,data:{message:"Succesfully created the Screen",data:result}}
}


exports.getScreensByTheatre = async(body) =>{
    const result  = await Screen.find({theatreId:body})

    // if(result.length ===0) return {status:404, message:"No Screens found for this theatre"}
    if(result.length===0) throw new Error("No theatre is found")

    return {status:200,data:{message:"Fetched the theatres",data:result}}
}


exports.updateScreen = async (id,body) =>{
    const result = await Screen.findByIdAndUpdate(id,body, {new:true})
    return {status:200,data:{message:"Successfully updated the Screen Details",data:result}}
}