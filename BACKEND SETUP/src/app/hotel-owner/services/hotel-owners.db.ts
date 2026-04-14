import HotelownerModel from "../models/hotelOwner.schema";




export const GET_HOTEL_OWNER_DETAILS_BY_ID = async (
  id: string,
  fields?: string
) => {
  const query = HotelownerModel.findById(id);
  return fields?.trim()
    ? await query.select(fields)
    : await query;
};