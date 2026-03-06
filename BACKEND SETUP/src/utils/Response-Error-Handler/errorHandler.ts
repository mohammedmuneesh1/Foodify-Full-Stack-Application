import { Response  } from "express";
import ResponseHandler from "./responseHandler"

const ErrorHandler=(res:Response,error:unknown,fnName:string,errorCode?:number)=>{
  console.error("GLOBAL ERROR:", error instanceof Error ? error?.message :  `An  error occurred at ${fnName} Function. Error:${error}`);
    return error instanceof Error ? ResponseHandler(res, errorCode || 500, false, null, error.message) : ResponseHandler(res, errorCode || 500,false,null, `Technical Error: Error:${error}` );
}
export default ErrorHandler;
