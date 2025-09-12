import APIAxios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface APIResponse {
  message: string;
  reference: string;
}

const getBanks = async () => {
  const res = await APIAxios.get("/wallet/forgot_pin/");
  return res.data as APIResponse;
};

export const useGetBankLists = () => {
  return useQuery({
    queryFn: getBanks,
    queryKey: ["banks-list"],
  });
};
