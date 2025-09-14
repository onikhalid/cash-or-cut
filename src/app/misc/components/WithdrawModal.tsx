"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import GradientButton from "@/components/ui/gradient-button";

import { useAuth } from "@/contexts/authentication";
import { useWithdraw } from "../api/postWithdrawWinnings";
import { useCreateTransactionPIN } from "../api/postCreatePIN";
import { useForgotTransactionPIN } from "../api/getForgotPIN";
import { useVerifyAccountNumber } from "../api/postVerifyAccountNumber";
import { useGetBankLists } from "../api/getBankList";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { AmountInput, Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/numbers";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface WithdrawModalProps {
  isWithdrawModalOpen: boolean;
  closeWithdrawModal: () => void;
}

const WithdrawModal = ({
  isWithdrawModalOpen,
  closeWithdrawModal,
}: WithdrawModalProps) => {
  const {
    state: { user, loading },
  } = useAuth();

  // Step management
  const [step, setStep] = useState(user?.has_pin ? "bank" : "create-pin");

  // Bank/account verification
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankError, setBankError] = useState("");
  const { data: allBanks, isLoading: banksLoading } = useGetBankLists();
  const verifyAccountMutation = useVerifyAccountNumber();
  const [bankSearch, setBankSearch] = useState("");
  const [isBankPopoverOpen, setIsBankPopoverOpen] = useState(false);
  const [filteredBanks, setFilteredBanks] = useState<typeof allBanks>([]);

  // Filter banks based on search
  useEffect(() => {
    if (!allBanks) {
      setFilteredBanks([]);
      return;
    }
    
    const filtered = allBanks.filter(
      (bank) =>
        bank.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
        bank.cbn_code.toLowerCase().includes(bankSearch.toLowerCase())
    );
    setFilteredBanks(filtered);
  }, [allBanks, bankSearch]);

  // Withdrawal details
  const [amount, setAmount] = useState(0);

  // PIN logic
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPin, setNewPin] = useState("");
  const [resetConfirmPin, setResetConfirmPin] = useState("");

  // API hooks
  const createPinMutation = useCreateTransactionPIN();
  const forgotPinQuery = useForgotTransactionPIN();
  const withdrawMutation = useWithdraw();

  useEffect(() => {
    if (!user) return;
    setStep(user.has_pin ? "bank" : "create-pin");
  }, [user]);

  // 1. Create PIN
  const handleCreatePin = () => {
    if (!pin || pin.length < 4 || !confirmPin || confirmPin.length < 4) {
      return toast.error("Enter a valid 4-digit PIN in both fields");
    }
    if (pin !== confirmPin) {
      return toast.error("PINs do not match");
    }
    createPinMutation.mutate(
      { pin: Number(pin), confirm_pin: confirmPin },
      {
        onSuccess: () => {
          toast.success("PIN created!");
          setStep("bank");
        },
      }
    );
  };

  // 2. Verify Account
  const handleVerifyAccount = () => {
    setBankError("");
    if (!selectedBank) {
      setBankError("Select a bank");
      return;
    }
    if (!accountNumber || accountNumber.length !== 10) {
      setBankError("Enter a valid 10-digit account number");
      return;
    }
    verifyAccountMutation.mutate(
      {
        account_number: Number(accountNumber),
        bank_code: selectedBank,
      },
      {
        onSuccess: (data) => {
          if (data?.account_name) {
            setAccountName(data.account_name);
            toast.success("Account verified!");
            setStep("withdraw");
          } else {
            setBankError("Could not verify account");
          }
        },
        onError: () => setBankError("Verification failed"),
      }
    );
  };

  // 3. Withdraw
  const handleWithdraw = () => {
    if (amount <= 0 || amount > (user?.winning_balance ?? 0)) {
      toast.error("Invalid amount");
      return;
    }
    setShowPinPrompt(true);
  };

  // 4. Submit withdrawal with PIN
  const submitWithdraw = () => {
    withdrawMutation.mutate(
      {
        amount,
        account_name: accountName,
        account_number: accountNumber,
        bank_name:
          allBanks?.find((b) => b.cbn_code === selectedBank)?.name ?? "",
        bank_code: selectedBank,
        pin,
      },
      {
        onSuccess: () => {
          toast.success("Withdrawal successful!");
          closeWithdrawModal();
        },
      }
    );
  };

  // 5. Forgot PIN
  const handleForgotPin = () => {
    forgotPinQuery.refetch();
    setShowForgotPin(true);
  };

  // 6. Reset PIN with OTP
  const handleResetPin = () => {
    if (
      !otp ||
      !newPin ||
      newPin.length < 4 ||
      !resetConfirmPin ||
      resetConfirmPin.length < 4
    ) {
      toast.error("Fill all fields correctly");
      return;
    }
    if (newPin !== resetConfirmPin) {
      toast.error("PINs do not match");
      return;
    }
    createPinMutation.mutate(
      { otp: Number(otp), pin: Number(newPin), confirm_pin: resetConfirmPin },
      {
        onSuccess: () => {
          toast.success("PIN reset!");
          setShowForgotPin(false);
          setShowPinPrompt(true);
        },
      }
    );
  };

  // --- Render logic ---
  if (step === "create-pin") {
    return (
      <Dialog open={isWithdrawModalOpen} onOpenChange={closeWithdrawModal}>
        <DialogContent>
          <DialogHeader>Set Transaction PIN</DialogHeader>
          <div className="mb-2">
            <label className="block text-sm mb-1 text-white">
              Enter 4-digit PIN
            </label>
            <InputOTP
              value={pin}
              onChange={setPin}
              maxLength={4}
              containerClassName="justify-start"
              className="size-16 text-xl bg-[#222] text-white border border-gray-700 rounded focus:outline-none focus:border-purple-500"
              type="password"
            >
              <InputOTPGroup>
                {[...Array(4)].map((_, i) => (
                  <InputOTPSlot
                    className="size-16 text-2xl"
                    key={i}
                    index={i}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1 text-white">
              Confirm 4-digit PIN
            </label>
            <InputOTP
              value={confirmPin}
              onChange={setConfirmPin}
              maxLength={4}
              containerClassName="justify-start"
              className="size-16 text-xl bg-[#222] text-white border border-gray-700 rounded focus:outline-none focus:border-purple-500"
              type="password"
            >
              <InputOTPGroup>
                {[...Array(4)].map((_, i) => (
                  <InputOTPSlot
                    className="size-16 text-2xl"
                    key={i}
                    index={i}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {/* Error display for PIN validation */}
          {pin.length > 0 && pin.length < 4 && (
            <div className="text-xs text-red-400 mb-2">
              PIN must be 4 digits
            </div>
          )}
          {confirmPin.length > 0 && confirmPin.length < 4 && (
            <div className="text-xs text-red-400 mb-2">
              Confirm PIN must be 4 digits
            </div>
          )}
          {pin.length === 4 &&
            confirmPin.length === 4 &&
            pin !== confirmPin && (
              <div className="text-xs text-red-400 mb-2">PINs do not match</div>
            )}
          <GradientButton onClick={handleCreatePin}>Set PIN</GradientButton>
        </DialogContent>
      </Dialog>
    );
  }

  
  
  if (step === "bank") {
    return (
      <Dialog open={isWithdrawModalOpen} onOpenChange={closeWithdrawModal}>
        <DialogContent>
          <DialogHeader>Enter Bank Details</DialogHeader>
          <div className="mb-4">
            <label className="block text-sm mb-1 text-white">Bank</label>
            <Popover open={isBankPopoverOpen} onOpenChange={setIsBankPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full px-3 py-2 rounded bg-[#222] text-white border border-gray-700 focus:outline-none focus:border-purple-500 flex justify-between items-center"
                >
                  {selectedBank
                    ? `${
                        allBanks?.find((b) => b.cbn_code === selectedBank)?.name
                      }`
                    : "Select bank"}
                  <span className="ml-2 text-xs">&#9660;</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-2 bg-[#222] border border-gray-700">
                <div>
                  <Input
                    placeholder="Search bank by name"
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    disabled={banksLoading}
                    className="mb-2 bg-[#333] text-white border-gray-600"
                  />
                  <div className="max-h-[200px] overflow-y-auto">
                    {filteredBanks?.length ? (
                      filteredBanks.map((bank) => (
                        <div
                          key={bank.cbn_code}
                          onClick={() => {
                            setSelectedBank(bank.cbn_code);
                            setIsBankPopoverOpen(false);
                          }}
                          className={`cursor-pointer p-2 rounded hover:bg-gray-700 flex justify-between items-center ${
                            selectedBank === bank.cbn_code
                              ? "bg-purple-900 text-white"
                              : ""
                          }`}
                        >
                          <span className="font-medium">{bank.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-400 px-2 py-1">
                        No banks found
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1 text-white">
              Account Number
            </label>
            <Input
              type="number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              maxLength={10}
              className="w-full px-3 py-2 rounded bg-[#222] text-white border border-gray-700 focus:outline-none focus:border-purple-500 mb-2"
              placeholder="10-digit account number"
            />
          </div>
          <GradientButton
            onClick={handleVerifyAccount}
            loading={verifyAccountMutation.isPending}
          >
            Verify Account
          </GradientButton>
          {bankError && (
            <div className="text-xs text-red-400 mt-2">{bankError}</div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isWithdrawModalOpen} onOpenChange={closeWithdrawModal}>
      <DialogContent>
        <DialogHeader>Withdraw Winnings</DialogHeader>
        {!showPinPrompt && (
          <>
            <div>
              <p>Balance</p>
              <p>
                {loading ? (
                  "Loading..."
                ) : user?.winning_balance !== undefined ? (
                  <span className="font-bold text-3xl">
                    {formatCurrency(user.winning_balance)}
                  </span>
                ) : (
                  <span className="text-red-400">Error fetching balance</span>
                )}
              </p>
            </div>
            <AmountInput
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={0}
              max={user?.winning_balance ?? 0}
              placeholder="Amount"
              className="w-full px-3 py-2 rounded bg-[#222] text-white border border-gray-700 focus:outline-none focus:border-purple-500 mb-4"
            />
            <GradientButton onClick={handleWithdraw}>Continue</GradientButton>
          </>
        )}

        {showPinPrompt && !showForgotPin && (
          <div className="mt-4 space-y-2">
            <label className="block text-sm mb-1 text-white">Enter PIN</label>
            <InputOTP
              value={pin}
              onChange={setPin}
              maxLength={4}
              containerClassName="justify-start"
              className="size-16 text-xl bg-[#222] text-white border border-gray-700 rounded focus:outline-none focus:border-purple-500"
              type="password"
            >
              <InputOTPGroup>
                {[...Array(4)].map((_, i) => (
                  <InputOTPSlot
                    className="size-16 text-2xl"
                    key={i}
                    index={i}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {pin.length > 0 && pin.length < 4 && (
              <div className="text-xs text-red-400 mb-2">
                PIN must be 4 digits
              </div>
            )}
            <footer className="space-x-4 mt-3">
              <GradientButton
                className=""
                onClick={submitWithdraw}
                disabled={pin.length !== 4}
                loading={withdrawMutation.isPending}
              >
                Withdraw
              </GradientButton>
              <button
                className="text-xs text-purple-400 underline mt-2"
                onClick={handleForgotPin}
              >
                Forgot PIN?
              </button>
            </footer>
          </div>
        )}

        {showForgotPin && (
          <div className="mt-4 space-y-2">
            <div className="mb-2">
              <label className="block text-sm mb-1 text-white">OTP</label>
              <InputOTP
                value={otp}
                onChange={setOtp}
                maxLength={6}
                containerClassName="justify-start"
                className="size-16 text-xl bg-[#222] text-white border border-gray-700 rounded focus:outline-none focus:border-purple-500"
              >
                <InputOTPGroup>
                  {[...Array(6)].map((_, i) => (
                    <InputOTPSlot className="size-16" key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1 text-white">New PIN</label>
              <InputOTP
                value={newPin}
                onChange={setNewPin}
                maxLength={4}
                containerClassName="justify-start"
                className="size-16 text-xl bg-[#222] text-white border border-gray-700 rounded focus:outline-none focus:border-purple-500"
                type="password"
              >
                <InputOTPGroup>
                  {[...Array(4)].map((_, i) => (
                    <InputOTPSlot
                      className="size-16 text-2xl"
                      key={i}
                      index={i}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1 text-white">
                Confirm PIN
              </label>
              <InputOTP
                value={resetConfirmPin}
                onChange={setResetConfirmPin}
                maxLength={4}
                containerClassName="justify-start"
                className="size-16 text-xl bg-[#222] text-white border border-gray-700 rounded focus:outline-none focus:border-purple-500"
                type="password"
              >
                <InputOTPGroup>
                  {[...Array(4)].map((_, i) => (
                    <InputOTPSlot
                      className="size-16 text-2xl"
                      key={i}
                      index={i}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            {/* Error display for PIN validation */}
            {newPin.length > 0 && newPin.length < 4 && (
              <div className="text-xs text-red-400 mb-2">
                New PIN must be 4 digits
              </div>
            )}
            {resetConfirmPin.length > 0 && resetConfirmPin.length < 4 && (
              <div className="text-xs text-red-400 mb-2">
                Confirm PIN must be 4 digits
              </div>
            )}
            {newPin.length === 4 &&
              resetConfirmPin.length === 4 &&
              newPin !== resetConfirmPin && (
                <div className="text-xs text-red-400 mb-2">
                  PINs do not match
                </div>
              )}
            <GradientButton
              className="w-full mt-5"
              onClick={handleResetPin}
              disabled={newPin.length !== 4 || resetConfirmPin.length !== 4}
            >
              Reset PIN
            </GradientButton>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawModal;
