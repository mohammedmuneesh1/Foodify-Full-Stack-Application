import axios from 'axios'
export const axiosErrorHandler = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    // Network error has no response
    if (!error.response) {
      console.error("Network Error:", error?.message); // NOW you'll see the real message
      return {
        statusCode: 500,
        success: false,
        response: `Network error: ${error?.message}`, // e.g. "ERR_CONNECTION_REFUSED"
      };
    }

    console.error("Axios error:", error?.response?.data?.response);
                                           //^^^^^^^^^^^
//                          This is the full response body object
//                          e.g. { message: "Invalid email", status: 401 }
//                          NOT a string!
    return {
      statusCode: error?.response?.status,
      success: false,
      response: error?.response?.data?.response,


      //error?.response?.data
//                          This is the full response body object
//                          e.g. { message: "Invalid email", status: 401 }
//                          NOT a string!
    };
  }

  if (error instanceof Error) {
    console.error("Error:", error?.message);
    return {
      statusCode: 500,
      success: false,
      response: error?.message,
    };
  }

  return "Something went wrong";
};