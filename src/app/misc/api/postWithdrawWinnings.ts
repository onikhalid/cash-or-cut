'use client'
import APIAxios from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

interface DTO {
  amount: number;
  account_name: string;
  account_number: string;
  bank_name: string;
  bank_code: string;
  pin: string;
}

interface APIResponse {
  message: string;
}

const withdraw = async (data: DTO) => {
  const res = await APIAxios.post("/wallet/withdraw/", data);
  return res.data as APIResponse;
};

export const useWithdraw = () => {
  return useMutation({
    mutationFn: withdraw,
    mutationKey: ["withdraw-winnings"],
  });
};
