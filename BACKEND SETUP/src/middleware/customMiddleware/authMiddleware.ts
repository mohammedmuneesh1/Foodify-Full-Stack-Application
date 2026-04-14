import { NextFunction, Request, Response } from 'express';
import  jwt from 'jsonwebtoken';
import { AuthUserInterface } from '../..';


// const authMiddleware = async(req:Request,res:Response,next:NextFunction):Promise<void>=>{

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
    try{
        // const token = req.headers.authorization;
        const token = req.cookies.token;
        
        if(!token || !token.startsWith('Bearer')){
            return res.status(401).json({success:false,data:null,response:'Unauthorized access'});
        }
        const jwtToken = token.split(' ')[1];

        if( !jwtToken){
            return res.status(401).json({success:false,data:null,response:'Unauthorized access'});
        }
        // console.log('rquest reached here',process.env.ACCESS_TOKEN_SECRET as string);

        const decoded = jwt
        .verify(jwtToken,process.env.ACCESS_TOKEN_SECRET as string) as AuthUserInterface;
        
        if(!decoded.uId) return res.status(401).json({
            success:false,
            data:null,
            response:'Unauthorized access'
        });
        
        req.user  = decoded;

        next();
    }
      
    catch (error: any) {
  if (error instanceof jwt.TokenExpiredError) {
    return res.status(401).json({
      success: false,
      data: null,
      response: 'Token has been expired.Please login again.',
    });
  }

  if (error instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({
      success: false,
      data: null,
      response: 'Invalid token. Please login again.',
    });
  }

  if (error instanceof jwt.NotBeforeError) {
    return res.status(401).json({
      success: false,
      data: null,
      response: 'Invalid token.Token not active yet',
    });
  }

  // unknown errors
  return res.status(500).json({
    success: false,
    data: null,
    response: error instanceof Error ? error.message : error,
  });
}

}

export default authMiddleware;

