'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export function useAuth(requiredRole) {
  const router = useRouter();
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    if (requiredRole && user?.role !== requiredRole) {
      const redirectMap = {
        PATIENT: '/patient/dashboard',
        ADMIN:   '/admin/dashboard',
        DOCTOR:  '/doctor/dashboard',
      };
      router.replace(redirectMap[user?.role] || '/auth/login');
    }
  }, [token, user, requiredRole, router]);

  return { user, token, isLoading: !token };
}