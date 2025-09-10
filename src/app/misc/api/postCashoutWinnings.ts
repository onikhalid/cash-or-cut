import APIAxios from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

interface DTO {
  reference: string;
  game_type: string;
  amount: number;
}
interface APIResponse {
  message: string;
}

const Cashout = async (data: DTO) => {
  const res = await APIAxios.post("/api/web/bomber_winnings/", data);
  return res.data as APIResponse;
};

export const useCashout = () => {
  return useMutation({
    mutationFn: Cashout,
    mutationKey: ["cashout"],
  });
};
