import CustomerModel from "../models/customer.schema";




export const GET_CUSTOMER_DETAILS_BY_ID = async (
  id: string,
  fields?: string
) => {
  const query = CustomerModel.findById(id);

  return fields?.trim()
    ? await query.select(fields)
    : await query;
};