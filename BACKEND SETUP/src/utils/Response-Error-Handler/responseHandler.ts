import { Response } from "express"

const ResponseHandler=(res:Response, status:number, success:boolean, data:unknown, response:string)=>{
    return res.status(status).json({ success: success, data: data, response: response });
}
export default ResponseHandler;