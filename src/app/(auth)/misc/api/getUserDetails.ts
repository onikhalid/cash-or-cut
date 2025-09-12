import APIAxios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface TUser {
  phone_number: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  account_num: string | null;
  account_name: string | null;
  bank_name: string | null;
  bank_code: string | null;
  bvn_number: string | null;
  gender: string;
  channel: string;
  referalcode: string;
  referal_url: string;
  referal_wallet_balance: number;
  play_balance: number;
  winning_balance: number;
  referrals_quantity: number;
  user_profile_image: string | null;
  account_details: Accountdetails;
  has_pin: boolean;
}

interface Accountdetails {
  account_number: string | null;
  account_name: string | null;
  bank_name: string | null;
}

const getUser = async (): Promise<TUser> => {
  const res = await APIAxios.get("/api/web/user/");
  return res.data;
};
export const useGetUser = (token: string | null) => {
  return useQuery({
    queryKey: ["get-user"],
    queryFn: getUser,
    enabled: !!token,
    refetchInterval: 30000,
    retry: 1,
  });
};
