import axios from 'axios';
import  { AxiosError } from "axios";

// Create instance
const axiosInstance = axios.create({
//   baseURL:import.meta.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080",
  baseURL:"http://localhost:8080",
  timeout: 10000,
  withCredentials: true, // important if using cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


// 🔹 REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  (config) => {
    // Example: attach token if needed
    // const token = localStorage.getItem("token");

    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error) => Promise.reject(error)
);


// 🔹 RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  //eslint-disable-next-line
  (error: AxiosError<any>) => {

    if (error.response) {

      const status = error.response.status;

      switch (status) {
        case 401:
          // console.error("Unauthorized - redirect to login");

          // Optional: redirect
          // window.location.href = "/signin";

          break;

        case 403:
          console.error("Forbidden");
          break;

        case 404:
          console.error("API not found");
          break;

        case 500:
          console.error("Server error");
          break;

        default:
          console.error("Unexpected error:", error.response.data);
      }

    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout");
    } else {
      console.error("Network error");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;