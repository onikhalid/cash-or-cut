import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import GradientButton from "@/components/ui/gradient-button";
import { useAuth } from "@/contexts/authentication";
import { useWithdraw } from "../api/postWithdrawWinnings";
import { useCreateTransactionPIN } from "../api/postCreatePIN";
import { useForgotTransactionPIN } from "../api/getForgotPIN";
import { toast } from "sonner";

interface WithdrawModalProps {
  isWithdrawModalOpen: boolean;
  closeWithdrawModal: () => void;
}

const WithdrawModal = ({ isWithdrawModalOpen, closeWithdrawModal }: WithdrawModalProps) => {
  const {
    state: { user },
  } = useAuth();
  const [step, setStep] = useState(user?.has_pin ? "withdraw" : "create-pin");
  const [amount, setAmount] = useState(0);
  const [pin, setPin] = useState("");
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  // API hooks
  const createPinMutation = useCreateTransactionPIN();
  const forgotPinQuery = useForgotTransactionPIN();
  const withdrawMutation = useWithdraw();

  // 1. Create PIN
  const handleCreatePin = () => {
    if (!pin || pin.length < 4) return toast.error("Enter a valid 4-digit PIN");
    createPinMutation.mutate({ pin: Number(pin), confirm_pin: pin }, {
      onSuccess: () => {
        toast.success("PIN created!");
        setStep("withdraw");
      }
    });
  };

  // 2. Withdraw
  const handleWithdraw = () => {
    if (amount <= 0 || amount > (user?.winning_balance ?? 0)) {
      toast.error("Invalid amount");
      return;
    }
    setShowPinPrompt(true);
  };

  // 3. Submit withdrawal with PIN
  const submitWithdraw = () => {
    withdrawMutation.mutate({
      amount,
      account_name: user?.account_name ?? "",
      account_number: user?.account_num ?? "",
      bank_name: user?.bank_name ?? "",
      bank_code: user?.bank_code ?? "",
      pin,
    }, {
      onSuccess: () => {
        toast.success("Withdrawal successful!");
        closeWithdrawModal();
      }
    });
  };

  // 4. Forgot PIN
  const handleForgotPin = () => {
    forgotPinQuery.refetch();
    setShowForgotPin(true);
  };

  // 5. Reset PIN with OTP
  const handleResetPin = () => {
    if (!otp || !newPin || newPin !== confirmPin) {
      toast.error("Fill all fields correctly");
      return;
    }
    createPinMutation.mutate({ otp: Number(otp), pin: Number(newPin), confirm_pin: confirmPin }, {
      onSuccess: () => {
        toast.success("PIN reset!");
        setShowForgotPin(false);
        setShowPinPrompt(true);
      }
    });
  };

  // Render logic
  if (step === "create-pin") {
    return (
      <Dialog open={isWithdrawModalOpen} onOpenChange={closeWithdrawModal}>
        <DialogContent>
          <DialogHeader>Set Transaction PIN</DialogHeader>
          <input type="password" value={pin} onChange={e => setPin(e.target.value)} maxLength={4} placeholder="Enter 4-digit PIN" className="w-full px-3 py-2 rounded bg-[#222] text-white border border-gray-700 focus:outline-none focus:border-purple-500 mb-4" />
          <GradientButton onClick={handleCreatePin}>Set PIN</GradientButton>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isWithdrawModalOpen} onOpenChange={closeWithdrawModal}>
      <DialogContent>
        <DialogHeader>Withdraw Winnings</DialogHeader>
        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} min={0} max={user?.winning_balance ?? 0} placeholder="Amount" className="w-full px-3 py-2 rounded bg-[#222] text-white border border-gray-700 focus:outline-none focus:border-purple-500 mb-4" />
        <GradientButton onClick={handleWithdraw}>Continue</GradientButton>
        {showPinPrompt && (
          <div className="mt-4 space-y-2">
            <input type="password" value={pin} onChange={e => setPin(e.target.value)} maxLength={4} placeholder="Enter PIN" className="w-full px-3 py-2 rounded bg-[#222] text-white border border-gray-700 focus:outline-none focus:border-purple-500" />
            <GradientButton onClick={submitWithdraw}>Withdraw</GradientButton>
            <button className="text-xs text-purple-400 underline mt-2" onClick={handleForgotPin}>Forgot PIN?</button>
          </div>
        )}
        {showForgotPin && (
          <div className="mt-4 space-y-2">
            <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" className="w-full px-3 py-2 rounded bg-[#222] text-white border border-gray-700 focus:outline-none focus:border-purple-500" />
            <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="New PIN" className="w-full px-3 py-2 rounded bg-[#222] text-white border border-gray-700 focus:outline-none focus:border-purple-500" />
            <input type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} placeholder="Confirm PIN" className="w-full px-3 py-2 rounded bg-[#222] text-white border border-gray-700 focus:outline-none focus:border-purple-500" />
            <GradientButton onClick={handleResetPin}>Reset PIN</GradientButton>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawModal;
