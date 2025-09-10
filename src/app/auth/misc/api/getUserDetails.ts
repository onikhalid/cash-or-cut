import APIAxios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface TUser {
  phone_number: string;
  email: string;
  first_name: null;
  last_name: null;
  middle_name: null;
  account_num: null;
  account_name: null;
  bank_name: null;
  bank_code: null;
  bvn_number: null;
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
