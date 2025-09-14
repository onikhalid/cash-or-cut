import APIAxios from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

interface DTO {
  account_number: number;
  bank_code: string;
}


const verifyAccount = async (data: DTO) => {
  const res = await APIAxios.post("/liberty/api/bank_verification/", data);
  return res.data ;
};

export const useVerifyAccountNumber = () => {
  return useMutation({
    mutationFn: verifyAccount,
    mutationKey: ["veerify-account-number"],
  });
};
