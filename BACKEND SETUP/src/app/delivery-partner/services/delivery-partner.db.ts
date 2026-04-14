import DeliveryPartnerModel from "../models/deliveryPartner.schema";




export const GET_DELIVERY_PARTNER_DETAILS_BY_ID = async (
  id: string,
  fields?: string
) => {
  const query = DeliveryPartnerModel.findById(id);
  return fields?.trim()
    ? await query.select(fields)
    : await query;
};