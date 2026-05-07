import { Request, Response } from "express";
import ResponseHandler from "../../utils/Response-Error-Handler/responseHandler";
import { GET_CUSTOMER_DETAILS_BY_ID } from "../customer/services/customer.db";
import { GET_DELIVERY_PARTNER_DETAILS_BY_ID } from "../delivery-partner/services/delivery-partner.db";
import { GET_HOTEL_OWNER_DETAILS_BY_ID } from "../hotel-owner/services/hotel-owners.db";

export async function GET_USER__DETAILS_BY_TOKEN(req: Request, res: Response): Promise<Response> {
    const customerId = req.user?.uId;
    const role = req.user?.role;
    if(!customerId || !role) return ResponseHandler(res, 404, false, null, "Customer not found.");
    let data;
    if (role === "Customer") {
    data = await GET_CUSTOMER_DETAILS_BY_ID(customerId, "-password");
  } else if (role === "Delivery Partner") {
    data = await GET_DELIVERY_PARTNER_DETAILS_BY_ID(customerId, "-password");
  } else if (role === "Hotel Owner") {
    data = await GET_HOTEL_OWNER_DETAILS_BY_ID(customerId, "-password");
  } else {
    return ResponseHandler(res,200,true,null, "Invalid role.");
  }
  if(!data) return ResponseHandler(res, 404, false, null, "Customer not found.");

  return ResponseHandler(res,200,true,{
         fullName: data?.fullName ?? "",
          email: data?.email ?? "",
          mobile: data?.mobile ?? "",
          role: data?.role,
    }, "Customer found successfully.");
}

