const jwt = require("jsonwebtoken")

module.exports = function(req,res,next){
    const token = req.header("x-auth-token")

    if(!token) return res.status(401).send("Access denied, No token is provided")

    console.log("The token provided is ",JSON.stringify(token));
    try{
        const decoded = jwt.verify(token,process.env.jwtPrivateKey)
        req.user = decoded;
        next()
    }catch(err){
        console.log("Something went wrong In auth middleware",err);
        res.status(400).send("Invalid Token")
        
    }
    
}