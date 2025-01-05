import axios from "axios";
// import { useToast } from "@/hooks/use-toast";
import { navigateToLogin as navigationWrapper } from "../services/navigationService";
import { getServerUrl, getToken } from "./utils";
// const { toast } = useToast();

const navigateToLogin = () => {
  // Assuming a function that navigates to the login screen
  navigationWrapper();
};
console.log("process.env", import.meta.env);
// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: getServerUrl(), // Replace with your API's base URL
  timeout: 30000, // Optional timeout
});

// Add a request interceptor to attach the token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Add Authorization token to headers if available
    const token = await getToken(); // Replace with your token storage logic
    console.log("token from axiosInstance.interceptors.request", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx triggers this function
    return response;
  },
  (error) => {
    // Handle errors for non-2xx status codes
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 400:
          console.error("Bad Request:", data?.message || "Invalid request.");
          break;
        case 401:
          console.error(
            "Unauthorized:",
            "Your session has expired. Please log in again."
          );
          localStorage.clear();
          navigateToLogin();
          break;
        case 403:
          console.error(
            "Forbidden:",
            "You do not have permission to perform this action."
          );
          break;
        case 404:
          console.error(
            "Not Found:",
            "The requested resource could not be found."
          );
          break;
        case 500:
          console.error(
            "Server Error:",
            "An error occurred on the server. Please try again later."
          );
          break;
        default:
          console.error(
            "Error:",
            data?.message || "An unexpected error occurred."
          );
      }
    } else if (error.request) {
      // Handle errors when no response was received
      console.error(
        "Network Error:",
        "Unable to reach the server. Please check your network connection."
      );
    } else {
      // Handle other errors
      console.error("Error:", error.message || "An unexpected error occurred.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
