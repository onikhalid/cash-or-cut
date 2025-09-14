import APIAxios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";



const getBanks = async () => {
  const res = await APIAxios.get("/wallet/fetch-banks/");
  return res.data as TBank[];
};

export const useGetBankLists = () => {
  return useQuery({
    queryFn: getBanks,
    queryKey: ["banks-list"],
  });
};


interface TBank {
  bank_code: string;
  cbn_code: string;
  name: string;
  bank_short_name: string;
  disabled_for_vnuban?: string;
  logo?: string;
  ussd_code?: string;
  bank_logo?: string;
}