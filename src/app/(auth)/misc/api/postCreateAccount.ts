import APIAxios from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export interface CreateAccountPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone: string;
  referral_code?: string;
}

export interface CreateAccountResponse {
  message: string;
  // Add more fields if needed
}

const createAccount = async (data: CreateAccountPayload): Promise<CreateAccountResponse> => {
  const res = await APIAxios.post("/api/web/create-account/", data);
  return res.data;
};

export const useCreateAccount = () => {
  return useMutation<CreateAccountResponse, Error, CreateAccountPayload>({
    mutationFn: createAccount,
    mutationKey: ["create-account"],
  });
};
