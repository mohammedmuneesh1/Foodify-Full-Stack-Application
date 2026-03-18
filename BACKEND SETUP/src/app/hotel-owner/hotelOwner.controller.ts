import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ErrorHandler from "../../utils/Response-Error-Handler/errorHandler";
import ResponseHandler from "../../utils/Response-Error-Handler/responseHandler";
import HotelownerModel from "./models/hotelOwner.schema";
import { COMPARE_PASSWORD_UTILS, GENERATESALT_UTILS, HASHPASSWORD_UTILS } from "../../utils/bcrypt.utils";
import { GENERATE_TOKEN_UTILS } from "../../utils/token.utils";

export async function HOTEL_OWNER_REGISTRATION(req: Request, res: Response): Promise<Response> {
       const { fullName, email, password, mobile } = req.body;
    if (!fullName || !email || !password || !mobile) {
      return ResponseHandler(res, 400, false, null, "fullName, email, password, and mobile are required.");
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const isCustomerExist = await HotelownerModel.findOne({ email: normalizedEmail });
    if (isCustomerExist) {
      return ResponseHandler(res, 409, false, null, "hotelOwner already exists with this email.");
    }
    const genSalt = await GENERATESALT_UTILS(10);
    const hashedPassword = await HASHPASSWORD_UTILS(String(password),genSalt);

    if(!password || password.length <6){
      return ResponseHandler(res, 400, false, null, "Password must be at least 6 characters long.");
    }
    if(!mobile || mobile.length <10){
      return ResponseHandler(res, 400, false, null, "Mobile number must be at least 10 characters long.");
    }

    const newCustomer = await HotelownerModel.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      mobile: String(mobile).trim(),
    });

     const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET as string | undefined;
     if (!accessTokenSecret)  return ResponseHandler(res, 500, false, null, "ACCESS_TOKEN_SECRET is not configured.");
    
        const token = GENERATE_TOKEN_UTILS(
        { uId: newCustomer._id,
          role: newCustomer.role 
        },
        accessTokenSecret,
        7
    );


    res.cookie('token', token, 
      { 
        secure:false,  //false for http and true for https,
        sameSite: "strict", //
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days,
        httpOnly: true,
       }
    );

    return ResponseHandler(
      res,
      201,
      true,
      {
        customerId: newCustomer._id,
        customer: {
          fullName: newCustomer.fullName,
          email: newCustomer.email,
          mobile: newCustomer.mobile,
          role: newCustomer.role,
        },
      },
      "hotelOwner registered successfully."
    );
}

export async function HOTEL_OWNER_LOGIN_CONTROLLER(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    if (!email || !password) {
      return ResponseHandler(res, 400, false, null, "Email and password are required.");
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    console.log('this is the email',normalizedEmail);
    const hotelOwner = await HotelownerModel.findOne({ email: normalizedEmail });
    console.log('hotelOwner',hotelOwner);

    if (!hotelOwner) {
      return ResponseHandler(res, 401, false, null, "Invalid email or password.");
    }
    const isMatch = await COMPARE_PASSWORD_UTILS( String(password), hotelOwner.password)
    if (!isMatch) {
      return ResponseHandler(res, 401, false, null, "Invalid email or password.");
    }
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET as string | undefined;
    if (!accessTokenSecret) {
      return ResponseHandler(res, 500, false, null, "ACCESS_TOKEN_SECRET is not configured.");
    }

    const token = GENERATE_TOKEN_UTILS(
        { uId: hotelOwner._id,
          role: hotelOwner.role 
        },
        accessTokenSecret,
        7
    );


        res.cookie('token', token, 
      { 
        secure:false,  //false for http and true for https,
        sameSite: "strict", //
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days,
        httpOnly: true,
       }
    );



    return ResponseHandler(
      res,
      200,
      true,
      {
        token,
        hotelOwner: {
          fullName: hotelOwner.fullName,
          email: hotelOwner.email,
          mobile: hotelOwner.mobile,
          role: hotelOwner.role,
        },
      },
      "Login successful."
    );
}

export async function HOTEL_OWNER_DATA_BY_ID(req: Request, res: Response): Promise<Response> {
    const customerId = req.params.id;
    const customer = await HotelownerModel.findById(customerId).select("-password");
    if (!customer) {
      return ResponseHandler(res, 404, false, null, "hotelOwner not found.");
    }
    return ResponseHandler(res, 200, true, customer, "hotelOwner found successfully.");
}
