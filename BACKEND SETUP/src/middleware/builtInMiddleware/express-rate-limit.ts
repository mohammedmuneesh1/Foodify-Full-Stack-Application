import { Request, Response } from "express";
import rateLimit from "express-rate-limit";

const rateLimiter =  rateLimit({
    windowMs:1*60*1000,
    max:500,
    handler:(req:Request,res:Response)=>{
        console.log(`Rate limit reached for IP: ${req.ip}`);
        return res.status(429).json({
            success:false,
            data:null,
            message:"Too Many Request from this ip address, please try again after 1 minute",
        })
    },
});

export default rateLimiter;













































// statusCode: 429,
// message:"Too Many Request from this ip address, please try again after 1 minute",



    // skip: (req) => req.user && req.user.role === "admin", 
    
    // handler: (req, res) => {   //use either message or handler 
    //     res.status(429).json({
    //         status: "fail",
    //         message: "Too many requests, please try again later.",
    //     });
    // },
    