import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    set => ({
      token: null,
      user:  null,

      setAuth: (token, user) => set({ token, user }),

      clearAuth: () => set({ token: null, user: null }),

      isAuthenticated: () => !!useAuthStore.getState().token,
    }),
    {
      name: 'shotlin_auth',
      partialize: state => ({ token: state.token, user: state.user }),
    }
  )
);