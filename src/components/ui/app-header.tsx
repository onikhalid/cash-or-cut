"use client";
import React from "react";
import Logo from "./Logo";
import { Download, Plus, Copy, CircleCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/authentication";
import { useIsMobile } from "@/hooks/use-mobile";
import { addCommasToNumber, formatCurrency } from "@/lib/numbers";
import { cn } from "@/lib/utils";
import { useGetUser } from "@/app/auth/misc/api/getUserDetails";
import { Dialog, DialogContent, DialogHeader } from "./dialog";
import { useBooleanStateControl } from "@/hooks";
import GradientButton from "./gradient-button";
import { AmountInput } from "./input";
import { toast } from "sonner";
import WithdrawModal from "@/app/misc/components/WithdrawModal";

const AppHeader = () => {
  const handleConvert = () => {
    if (!user?.winning_balance || amountToConvert > user.winning_balance) {
      toast.error("Amount exceeds available winnings");
      return;
    }
    // TODO: Add conversion logic here (API call etc)
    toast.success("Conversion successful!");
  };
  const [copied, setCopied] = useState(false);
  const [amountToConvert, setAmountToConvert] = useState<number>(0);
  // const { mutate: withdrawWinnings, isPending: isWithdrawing } = useWithdraw();

  const { soundEnabled, setSoundEnabled } = useAuth();
  const {
    state: { token },
  } = useAuth();
  const isMobile = useIsMobile();
  const { data: user } = useGetUser(token);

  const {
    state: isAddFundModalOpen,
    setTrue: openAddFundModal,
    setFalse: closeAddFundModal,
  } = useBooleanStateControl();
  const {
    state: isWithdrawModalOpen,
    setTrue: openWithdrawModal,
    setFalse: closeWithdrawModal,
  } = useBooleanStateControl();

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

        <article
          className="flex items-center gap-2 bg-[#FFFFFF1A] rounded-xs pl-3 pr-0 !cursor-pointer "
          onClick={openAddFundModal}
          title="Add Funds"
        >
          <span className="text-white font-bold">
            {addCommasToNumber(user?.play_balance ?? 0)}
          </span>
          <button className="flex items-center justify-center bg-green-500 hover:bg-green-600 p-1  size-8 cursor-pointer">
            <Plus className="size-4 cursor-pointer" />
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

      <Dialog open={isAddFundModalOpen} onOpenChange={closeAddFundModal}>
        <DialogContent>
          <DialogHeader>Add Funds</DialogHeader>
          <div>
            <p className="text-[0.9rem] text-gray-500">
              To add funds to your account, send any amount to the following
              account
            </p>
            <section className="mt-2 p-4 bg-[#3b3b3b85] rounded text-center space-y-1.5">
              <div className="flex items-center justify-center gap-1.5">
                <p className="text-3xl font-bold font-mono break-all">
                  {user?.account_num}
                </p>
                <button
                  type="button"
                  className="p-2 rounded hover:bg-purple-700 transition !cursor-pointer"
                  title="Copy account number"
                  onClick={() => {
                    if (user?.account_num) {
                      navigator.clipboard.writeText(user.account_num);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1200);
                    }
                  }}
                >
                  {copied ? (
                    <CircleCheck className="size-6 text-green-500" />
                  ) : (
                    <Copy className="size-6 text-white" />
                  )}
                </button>
              </div>
              <p className="text-xl font-medium text-gray-300">
                {user?.account_name}
              </p>
              <p className="text-lg text-gray-300">{user?.bank_name}</p>
            </section>
            <p className="text-center my-8 text-sm text-gray-400</p>">
              ---------- OR ----------
            </p>

            <p className="text-[0.9rem] text-gray-500">
              Convert funds from your winnings balance to your balance
            </p>
            <section className="mt-2 p-4 bg-[#3b3b3b85] rounded text-center space-y-2">
              <p className="text-lg font-medium text-gray-300">
                Winning:{" "}
                <span className="font-semibold">
                  {formatCurrency(user?.winning_balance ?? 0)}
                </span>
              </p>
              <AmountInput
                type="number"
                min={0}
                max={user?.winning_balance ?? 0}
                value={amountToConvert}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAmountToConvert(val);
                }}
                className="w-full px-3 py-2 rounded bg-[#222] text-white border border-gray-700 focus:outline-none focus:border-purple-500"
                placeholder="Amount to convert"
              />
              <GradientButton
                type="button"
                title="Convert winnings"
                disabled={!amountToConvert || amountToConvert <= 0}
                onClick={handleConvert}
              >
                Convert
              </GradientButton>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      <WithdrawModal
        isWithdrawModalOpen={isWithdrawModalOpen}
        closeWithdrawModal={closeWithdrawModal}
      />
    </header>
  );
};

export default AppHeader;
