import Axios, { AxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;
export const APIAxios = Axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAxiosDefaultToken = (token: string) => {
  APIAxios.defaults.headers.common.Authorization = `Token ${token}`;
};

export const deleteAxiosDefaultToken = () => {
  delete APIAxios.defaults.headers.common.Authorization;
};

export const handleInactiveAccountRedirect = () => {
  if (typeof window !== "undefined") {
    if (window.location.pathname.startsWith("/auth/")) return;
    window.location.href = "/auth/login";
  }
};

APIAxios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Log the entire error response to the console
    console.log("Axios Error Response:", error.response);

    if (error.response) {
      const errorData = error.response.data as { error?: { detail?: string } };
      const errorDetail = errorData.error?.detail;

      if (
        error.response.status == 401 ||
        errorDetail === "inactive account" ||
        errorDetail === "Invalid token." ||
        errorDetail === "Authentication credentials were not provided"
      ) {
        console.log("Authentication Error:", errorDetail);
        deleteAxiosDefaultToken();

        handleInactiveAccountRedirect();
      }
    }
    return Promise.reject(error);
  }
);

export default APIAxios;
