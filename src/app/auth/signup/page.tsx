import React from "react";
import { CreateAccountForm } from "../misc/components";

const SignupPage: React.FC = () => {
  return (
    <div className="min-h-full flex flex-col items-center pb-8">
      <div className="bg-[#140033] p-6 md:p-9 lg:px-12 rounded-2xl">
        <h1 className="font-bold text-4xl">Create Account</h1>
        <p className="text-balance mb-4 text-white/70 text-sm max-w-[20ch]">
          Please fill in the details below to create a new account.
        </p>
        <CreateAccountForm />
      </div>
    </div>
  );
};

export default SignupPage;
