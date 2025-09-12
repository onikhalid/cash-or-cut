"use client";
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePhoneLogin } from "@/app/(auth)/misc/api/postLogin";
import tokenStorage from "@/lib/tokens";
import { setAxiosDefaultToken } from "@/lib/axios";
import { useAuth } from "@/contexts/authentication";
import GradientButton from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";
import ErrorDialog from "@/components/ui/error-dialog";
import { useForm } from "react-hook-form";
import { useBooleanStateControl } from "@/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  phone: z.string().min(10, "Enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm: React.FC<{ closeAuthModal?: () => void }> = ({
  closeAuthModal,
}) => {
  const {
    state: showErrorDialog,
    setTrue: openErrorDialog,
    setFalse: closeErrorDialog,
  } = useBooleanStateControl();

  const { dispatch, refetchUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  const {
    mutate: login,
    isPending: isLoggingIn,
    error: LoginError,
  } = usePhoneLogin();
  const router = useRouter();

  const onSubmit = async (data: LoginFormValues) => {
    login(data, {
      onSuccess: async (res) => {
        setAxiosDefaultToken(res.token);
        await tokenStorage.setAccessToken(res.token);
        dispatch({ type: "SET_TOKEN", payload: res.token });
        await refetchUser();
        router.refresh();
        closeAuthModal?.();
      },
      onError: () => {
        dispatch({ type: "SET_ERROR", payload: "Login failed" });
        openErrorDialog();
      },
    });
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 w-full mx-auto"
      >
        <div>
          <Input
            id="phone"
            type="tel"
            label="Phone"
            autoComplete="tel"
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
        <GradientButton
          type="submit"
          loading={isSubmitting || isLoggingIn}
          fullWidth
        >
          Login
        </GradientButton>
      </form>
      <ErrorDialog
        isOpen={showErrorDialog}
        onClose={closeErrorDialog}
        heading="Login Error"
        subheading={LoginError?.message || "Login failed. Please try again."}
      />
    </>
  );
};

export default LoginForm;
