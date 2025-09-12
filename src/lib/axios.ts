import Axios from "axios";

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



export default APIAxios;
