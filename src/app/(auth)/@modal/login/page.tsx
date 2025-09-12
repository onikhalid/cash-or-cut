import LoginForm from "@/app/(auth)/misc/components/LoginForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import React from "react";

const LoginPage: React.FC = () => {
  return (
    <Dialog modal open>
      <DialogContent>
        <div className="h-full flex flex-col items-center justify-centerbg-[#140033]">
          <div className=" p-8 rounded-xl">
            <h1 className="font-bold text-4xl">Welcome back</h1>
            <p className="text-balance mb-4 text-white/70 text-sm">
              Please enter your credentials to log in.
            </p>
            <LoginForm />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPage;
