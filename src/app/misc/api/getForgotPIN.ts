import APIAxios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface APIResponse {
  message: string;
  reference: string;
}

const createPIN = async () => {
  const res = await APIAxios.get("/wallet/forgot_pin/");
  return res.data as APIResponse;
};

export const useForgotTransactionPIN = (enabled: boolean = false) => {
  return useQuery({
    queryFn: createPIN,
    queryKey: ["forgot-transaction-pin"],
    enabled,
  });
};
