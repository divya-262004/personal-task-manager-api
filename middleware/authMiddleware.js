import jwt  from "jsonwebtoken";
import config from "../config/config.js";

const authMiddleWare=(req, res, next)=>{
    try{
        const authHeader=req.headers.authorization;

        if(!authHeader){
            return res.status(401).json({
                message:"Authorizarion token required"
            })  
        }

        const token=authHeader.split(" ")[1];
        const decoded = jwt.verify(
            token,
            config.jwt.secret
        );

        req.userId = decoded.userId;

        next();

    }catch(error){
        res.status(500).json(
            {
                message:"Authentication failed"
            }
        )
    }
}

export default authMiddleWare;