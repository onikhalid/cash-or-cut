import APIAxios from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

interface LoginData {
  phone: string;
  password: string;
}
interface LoginResponse {
  token: string;
}

const Login = async (data: LoginData) => {
  const res = await APIAxios.post("/api/web/phone-login/", data);
  return res.data as LoginResponse;
};

export const usePhoneLogin = () => {
  return useMutation({
    mutationFn: Login,
    mutationKey: ["phone-login"],
  });
};
