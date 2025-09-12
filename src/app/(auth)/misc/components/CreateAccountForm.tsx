"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateAccount } from "@/app/(auth)/misc/api/postCreateAccount";
import GradientButton from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";
import ErrorDialog from "@/components/ui/error-dialog";
import { useRouter } from "next/navigation";
import { useBooleanStateControl } from "@/hooks";
import Link from "next/link";

const schema = z
  .object({
    first_name: z.string().min(2, "First name required"),
    last_name: z.string().min(2, "Last name required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(6, "Confirm your password"),
    phone: z.string().min(10, "Enter a valid phone number"),
    referral_code: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof schema>;

const CreateAccountForm: React.FC = ({
  closeAuthModal,
}: {
  closeAuthModal?: () => void;
}) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const {
    mutate: createAccount,
    isPending: isCreatingAccount,
    isError: isCreateAccountError,
    error: createAccountError,
  } = useCreateAccount();
  const {
    state: showErrorDialog,
    setTrue: openErrorDialog,
    setFalse: closeErrorDialog,
  } = useBooleanStateControl();
  const onSubmit = (data: FormValues) => {
    createAccount(data, {
      onSuccess: () => {
        router.refresh();
        closeAuthModal?.();
      },
      onError: () => {
        openErrorDialog();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
      <div>
        <Input
          id="first_name"
          label="First Name"
          {...register("first_name")}
          hasError={!!errors.first_name}
          errorMessage={errors.first_name?.message}
        />
      </div>
      <div>
        <Input
          id="last_name"
          label="Last Name"
          {...register("last_name")}
          hasError={!!errors.last_name}
          errorMessage={errors.last_name?.message}
        />
      </div>
      <div>
        <Input
          id="email"
          type="email"
          label="Email"
          {...register("email")}
          hasError={!!errors.email}
          errorMessage={errors.email?.message}
        />
      </div>
      <div>
        <Input
          id="phone"
          type="text"
          label="Phone"
          {...register("phone")}
          hasError={!!errors.phone}
          errorMessage={errors.phone?.message}
        />
      </div>
      <div>
        <Input
          id="password"
          type="password"
          label="Password"
          {...register("password")}
          hasError={!!errors.password}
          errorMessage={errors.password?.message}
        />
      </div>
      <div>
        <Input
          id="confirm_password"
          type="password"
          label="Confirm Password"
          {...register("confirm_password")}
          hasError={!!errors.confirm_password}
          errorMessage={errors.confirm_password?.message}
        />
      </div>
      <div>
        <Input
          id="referral_code"
          type="text"
          label="Referral Code (optional)"
          {...register("referral_code")}
        />
      </div>
      <GradientButton
        type="submit"
        loading={isSubmitting || isCreatingAccount}
        fullWidth
      >
        Create Account
      </GradientButton>
      <ErrorDialog
        isOpen={showErrorDialog}
        onClose={closeErrorDialog}
        heading="Account Creation Error"
        subheading={
          createAccountError?.message ||
          "Account creation failed. Please try again."
        }
      />
    </form>
  );
};

export default CreateAccountForm;
