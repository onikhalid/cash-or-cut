import APIAxios from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

interface DTO {
  otp?: number;
  pin: number;
  confirm_pin: string;
}
interface APIResponse {
  message: string;
  reference: string;
}

const createPIN = async (data: DTO) => {
  const res = await APIAxios.post("/wallet/create_pin/", data);
  return res.data as APIResponse;
};

export const useCreateTransactionPIN = () => {
  return useMutation({
    mutationFn: createPIN,
    mutationKey: ["create-transaction-pin"],
  });
};
