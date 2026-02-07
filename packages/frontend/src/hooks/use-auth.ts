import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/auth.store";
import type { User } from "@/api/types";
import {
  requestOtp,
  verifyOtp,
  setPassword as setPasswordApi,
  loginPassword,
  logout as logoutApi,
} from "@/api/auth.api";
import { getApiErrorMessage } from "@/api/axios";
import { toaster } from "@/components/ui/toaster";

function getDashboardPath(user: User): string {
  if (user.roles?.includes("seeker")) return "/seeker/dashboard";
  if (user.roles?.includes("recruiter")) return "/recruiter/dashboard";
  return "/";
}

export function useRequestOtp() {
  return useMutation({
    mutationFn: requestOtp,
    onError: (err) => {
      toaster.create({ title: "خطا", description: getApiErrorMessage(err), type: "error" });
    },
  });
}

export type VerifyOtpPayload = Parameters<typeof verifyOtp>[0] & { password?: string };

export function useVerifyOtp() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (payload: VerifyOtpPayload) => {
      const { password: _p, ...apiPayload } = payload;
      return verifyOtp(apiPayload);
    },
    onSuccess: async (data, variables) => {
      setAuth(data.user, data.accessToken);
      if (variables?.password) {
        try {
          await setPasswordApi(variables.password);
        } catch (err) {
          toaster.create({
            title: "خطا",
            description: getApiErrorMessage(err),
            type: "error",
          });
          return;
        }
      }
      navigate(getDashboardPath(data.user), { replace: true });
    },
    onError: (err) => {
      toaster.create({ title: "خطا", description: getApiErrorMessage(err), type: "error" });
    },
  });
}

export function useLoginPassword() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: loginPassword,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      navigate(getDashboardPath(data.user), { replace: true });
    },
    onError: (err) => {
      toaster.create({ title: "خطا", description: getApiErrorMessage(err), type: "error" });
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      clearAuth();
      navigate("/auth/login", { replace: true });
    },
    onSettled: () => {
      clearAuth();
      navigate("/auth/login", { replace: true });
    },
  });
}
