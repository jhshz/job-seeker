import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  phoneE164: string;
  isPhoneVerified: boolean;
  status: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = {
  user: AuthUser;
  tokens: AuthTokens;
};

type AuthState = {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  setAuth: (payload: AuthResponse) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      setAuth: (payload) => {
        set({ user: payload.user, tokens: payload.tokens });
      },
      clearAuth: () => {
        set({ user: null, tokens: null });
      },
    }),
    {
      name: "job-seeker-auth",
      partialize: (state) => ({ user: state.user, tokens: state.tokens }),
    },
  ),
);

