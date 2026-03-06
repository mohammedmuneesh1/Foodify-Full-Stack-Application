import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../../utils/Response-Error-Handler/errorHandler"; // Make sure the path is correct

type TryCatchHandler = (req: Request,res: Response,next: NextFunction) => Promise<Response>; //()=> means a function no need for function name

const tryCatch = (tryCatchHandler: TryCatchHandler) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await tryCatchHandler(req, res, next);   // fn(req,res,next);
    } catch (error) {
      console.error("error", error instanceof Error ? error?.message: error); // Optional: logging
      // Call ErrorHandler to handle the response
      ErrorHandler(res, error, tryCatchHandler.name); // Pass fn name for context
    }
  };

export default tryCatch;