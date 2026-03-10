import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ErrorHandler from "../../utils/Response-Error-Handler/errorHandler";
import ResponseHandler from "../../utils/Response-Error-Handler/responseHandler";
import DeliveryPartnerModel from "./models/deliveryPartner.schema";
import { COMPARE_PASSWORD_UTILS, GENERATESALT_UTILS, HASHPASSWORD_UTILS } from "../../utils/bcrypt.utils";
import { GENERATE_TOKEN_UTILS } from "../../utils/token.utils";

export async function DELIVERY_PARTNER_REGISTRATION(req: Request, res: Response): Promise<Response> {
    const { fullName, email, password, mobile } = req.body;

    if (!fullName || !email || !password || !mobile) {
      return ResponseHandler(res, 400, false, null, "fullName, email, password, and mobile are required.");
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const isCustomerExist = await DeliveryPartnerModel.findOne({ email: normalizedEmail });
    if (isCustomerExist) {
      return ResponseHandler(res, 409, false, null, "Customer already exists with this email.");
    }
    const genSalt = await GENERATESALT_UTILS(10);
    const hashedPassword = await HASHPASSWORD_UTILS(String(password),genSalt);

    const newCustomer = await DeliveryPartnerModel.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      mobile: String(mobile).trim(),
      role: "Customer",
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

export async function DELIVERY_PARTNER_LOGIN(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    if (!email || !password) {
      return ResponseHandler(res, 400, false, null, "Email and password are required.");
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const customer = await DeliveryPartnerModel.findOne({ email: normalizedEmail });
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

export async function GET_DELIVERY_PARTNER_DATA_BY_ID(req: Request, res: Response): Promise<Response> {
    const customerId = req.params.id;
    const customer = await DeliveryPartnerModel.findById(customerId).select("-password");
    if (!customer) {
      return ResponseHandler(res, 404, false, null, "Customer not found.");
    }
    return ResponseHandler(res, 200, true, customer, "Customer found successfully.");
}
