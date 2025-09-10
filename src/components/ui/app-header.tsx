"use client";
import React from "react";
import Logo from "./Logo";
import { useContext } from "react";
import { Button } from "./button";
import { Download, Plus } from "lucide-react";
import { useAuth } from "@/contexts/authentication";
import { useIsMobile } from "@/hooks/use-mobile";
import { addCommasToNumber, formatCurrency } from "@/lib/numbers";
import { cn } from "@/lib/utils";
import { useGetUser } from "@/app/auth/misc/api/getUserDetails";

const AppHeader = () => {
  const { soundEnabled, setSoundEnabled } = useAuth();
  const {
    state: { token },
  } = useAuth();
  const isMobile = useIsMobile();
  const { data: user } = useGetUser(token);

  return (
    <header className="flex items-center justify-between p-4 h-[80px] md:h-[100px] container mx-auto">
      <div className="flex items-center gap-4">
        <Logo width={isMobile ? 80 : 150} />
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <article className="flex items-center gap-2 bg-[#FFFFFF1A] rounded-xs pl-3 pr-0 ">
          <span className="text-white font-bold">
            {formatCurrency(user?.winning_balance ?? 0)}
          </span>
          <button className="flex items-center justify-center bg-green-500 hover:bg-green-600 p-1  size-8">
            <Download className="size-4" />
          </button>
        </article>

        <article className="flex items-center gap-2 bg-[#FFFFFF1A] rounded-xs pl-3 pr-0 ">
          <span className="text-white font-bold">
            {addCommasToNumber(user?.play_balance ?? 0)}
          </span>
          <button className="flex items-center justify-center bg-green-500 hover:bg-green-600 p-1  size-8">
            <Plus className="size-4" />
          </button>
        </article>

        <div className="hidden md:flex items-center gap-1 md:gap-2">
          <button
            type="button"
            className={cn(
              "px-3 py-1 rounded-full bg-purple-800 text-white text-xs font-bold border border-purple-500 hover:bg-purple-700",
              isMobile ? "p-1 text-md" : ""
            )}
            onClick={() => setSoundEnabled((v: boolean) => !v)}
          >
            <span className={cn(!isMobile && "hidden")}>
              {soundEnabled ? "🔊" : "🔇"}
            </span>
            <span className={cn(isMobile && "hidden")}>
              {soundEnabled ? "🔊 Sound On" : "🔇 Muted"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
