import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/auth.store";
import {
  requestOtp,
  verifyOtp,
  loginPassword,
  logout as logoutApi,
} from "@/api/auth.api";
import { getApiErrorMessage } from "@/api/axios";
import { toaster } from "@/components/ui/toaster";

export function useRequestOtp() {
  return useMutation({
    mutationFn: requestOtp,
    onError: (err) => {
      toaster.create({ title: "خطا", description: getApiErrorMessage(err), type: "error" });
    },
  });
}

export function useVerifyOtp() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      navigate("/", { replace: true });
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
      navigate("/", { replace: true });
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
