import APIAxios from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

interface DTO {
  amount: number;
  game_type: string;
}
interface APIResponse {
  message: string;
  reference: string;
}

const StartGame = async (data: DTO) => {
  const res = await APIAxios.post("/api/web/bomber_game_play/", data);
  return res.data as APIResponse;
};

export const useStartGame = () => {
  return useMutation({
    mutationFn: StartGame,
    mutationKey: ["start-game"],
  });
};
