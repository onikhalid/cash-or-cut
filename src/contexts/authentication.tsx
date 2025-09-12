/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import tokenStorage from "@/lib/tokens";
import APIAxios, { setAxiosDefaultToken, deleteAxiosDefaultToken } from "@/lib/axios";
import { useGetUser } from "@/app/auth/misc/api/getUserDetails";
import type { TUser } from "@/app/auth/misc/api/getUserDetails";
import axios from "axios";

interface AuthState {
  user: TUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "SET_USER"; payload: TUser | null }
  | { type: "SET_TOKEN"; payload: string | null }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: AuthState = {
  user: null,
  token: null,
  loading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, loading: false };
    case "SET_TOKEN":
      return { ...state, token: action.payload };
    case "LOGOUT":
      deleteAxiosDefaultToken();
      tokenStorage.removeAccessToken();
      return { ...initialState, loading: false };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

const AuthContext = createContext<
  | {
      state: AuthState;
      refetchUser: () => Promise<void>;
      dispatch: React.Dispatch<AuthAction>;
      soundEnabled: boolean;
      setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    }
  | undefined
>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const router = useRouter();
  const [user, setUser] = useState<TUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";

  const getUserDetails = async (token: string) => {
    try {
      setIsLoading(true);
      console.log("token gotten in getUserDetails:", token);
      const res = await APIAxios.get(
        `/api/web/user/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      return res.data;
    } catch (error) {
      setIsError(true);
      console.log(
        "Error response in getUserDetails:",
        (error as any)?.response.data
      )
      if (
        (error as any)?.response.data.detail ==
        "Authentication credentials were not provided."
        ||
        (error as any)?.response.data.detail ==
        "Invalid token."
      ) {
        dispatch({ type: "LOGOUT" });
        tokenStorage.removeAccessToken();
        deleteAxiosDefaultToken();
     }
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const initialize = async () => {
      const token = tokenStorage.getAccessToken();
      if (token) {
        setAxiosDefaultToken(token);
        const res = await getUserDetails(token);
        dispatch({ type: "SET_USER", payload: res });
        dispatch({ type: "SET_TOKEN", payload: token });
      } else {
        dispatch({ type: "LOGOUT" }); 
        return;
      }
    };
    initialize();
  }, [router, pathname]);

  const refetchUser = async () => {
    if (state.token) {
      const res = await getUserDetails(state.token);
      dispatch({ type: "SET_USER", payload: res });
    }
  };

  return (
    <AuthContext.Provider
      value={{ state, dispatch, soundEnabled, setSoundEnabled, refetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
