import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ErrorHandler from "../../utils/Response-Error-Handler/errorHandler";
import ResponseHandler from "../../utils/Response-Error-Handler/responseHandler";
import CustomerModel from "./models/customer.schema";
import { COMPARE_PASSWORD_UTILS, GENERATESALT_UTILS, HASHPASSWORD_UTILS } from "../../utils/bcrypt.utils";
import { GENERATE_TOKEN_UTILS } from "../../utils/token.utils";
import googleClient from "../../configs/googleAuth";
import axios from "axios";

export async function customerRegisterFn(req: Request, res: Response): Promise<Response> {
    const { fullName, email, password, mobile } = req.body;
    if (!fullName || !email || !password || !mobile) {
      return ResponseHandler(res, 400, false, null, "fullName, email, password, and mobile are required.");
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const isCustomerExist = await CustomerModel.findOne({ email: normalizedEmail });
    if (isCustomerExist) {
      return ResponseHandler(res, 409, false, null, "Customer already exists with this email.");
    }
    const genSalt = await GENERATESALT_UTILS(10);
    const hashedPassword = await HASHPASSWORD_UTILS(String(password),genSalt);

    if(!password || password.length <6){
      return ResponseHandler(res, 400, false, null, "Password must be at least 6 characters long.");
    }
    if(!mobile || mobile.length <10){
      return ResponseHandler(res, 400, false, null, "Mobile number must be at least 10 characters long.");
    }

    const newCustomer = await CustomerModel.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      mobile: String(mobile).trim(),
      role: "Customer",
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



        res.cookie('token',
           token,
            {
              httpOnly: process.env.COOKIE_HTTP_STATUS === 'true',
               maxAge: 7 * 24 * 60 * 60 * 1000,
              secure: process.env.COOKIE_HTTP_SECURE_STATUS === 'true',
              });


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
      "Customer registered successfully."
    );
}




export async function customerLoginFn(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    if (!email || !password) {
      return ResponseHandler(res, 400, false, null, "Email and password are required.");
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const customer = await CustomerModel.findOne({ email: normalizedEmail });
    if (!customer) {
      return ResponseHandler(res, 401, false, null, "Invalid email or password.");
    }

    const isMatch = await COMPARE_PASSWORD_UTILS( String(password), customer.password)
    if (!isMatch) {
      return ResponseHandler(res, 401, false, null, "Invalid email or password.");
    }
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET as string | undefined;
    if (!accessTokenSecret) {
      return ResponseHandler(res, 500, false, null, "ACCESS_TOKEN_SECRET is not configured.");
    }

    const token = GENERATE_TOKEN_UTILS(
        { uId: customer._id,
          role: customer.role 
        },
        accessTokenSecret,
        7
    );


        res.cookie('token',
           token,
            {
              httpOnly: process.env.COOKIE_HTTP_STATUS === 'true',
               maxAge: 7 * 24 * 60 * 60 * 1000,
              secure: process.env.COOKIE_HTTP_SECURE_STATUS === 'true',
              });



    return ResponseHandler(
      res,
      200,
      true,
      {
        token,
        customer: {
          fullName: customer.fullName,
          email: customer.email,
          mobile: customer.mobile,
          role: customer.role,
        },
      },
      "Login successful."
    );
}

export async function getCustomerByIdFn(req: Request, res: Response): Promise<Response> {
    const customerId = req.params.id;
    const customer = await CustomerModel.findById(customerId).select("-password");
    if (!customer) {
      return ResponseHandler(res, 404, false, null, "Customer not found.");
    }
    return ResponseHandler(res, 200, true, customer, "Customer found successfully.");
}



export async function CUSTOMER_SIGN_OUT_CONTROLLER(req:Request,res:Response):Promise<Response>{
  res.clearCookie('token');
  return ResponseHandler(res, 200, true, null, "Sign out successful.");
}




/**
 * @desc    GOOGLE SIGNIN 
 * @route   GET /api/customers/google-signin
 * @access  Private
 * @returns  MY profile object
 */

export async function GOOGLE_LOGIN_CONTROLLER(req:Request,res:Response):Promise<Response>{
    const { code } = req.body;

  if (!code) {
    return ResponseHandler(res, 400, false, null, 'Authorization code missing"');
  }


  // 1. Exchange auth code for tokens
  const { tokens } = await googleClient.getToken(code);
  googleClient.setCredentials(tokens);

  // 2. Fetch Google user info
  const googleUserRes = await axios.get(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    }
  );
  const { email, name, picture: image , verified_email } = googleUserRes.data;

  if (!email) {
    return ResponseHandler(res, 400, false, null, "Google account has no email");
  }

  //    const {email,name,image} = req.body;

  let isUserExist = await CustomerModel.findOne({ email });
  if (!isUserExist) {
    isUserExist = await CustomerModel.create({
      fullName:name, 
      email,
      image:{
        type:"Cloudinary",
        url:image
      },
      isEmailVerified:verified_email
      });
  }
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET as string | undefined;
  if (!accessTokenSecret)  return ResponseHandler(res, 500, false, null, "ACCESS_TOKEN_SECRET is not configured.");
    
  
  const token = GENERATE_TOKEN_UTILS(
    {
      id: isUserExist._id,
      name: isUserExist.name,
    },
    accessTokenSecret,
    7,
  );

  res.cookie('token',
   token,
    {
      httpOnly: process.env.COOKIE_HTTP_STATUS === 'true',
       maxAge: 7 * 24 * 60 * 60 * 1000,
       sameSite:'strict',
      secure: process.env.COOKIE_HTTP_SECURE_STATUS === 'true',
      });
  return ResponseHandler(res, 200, true, null, "Login successful.");  
}


