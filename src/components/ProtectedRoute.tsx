"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { status, data: session } = useSession();
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && status === 'unauthenticated') {
      router.replace('/login');
    }

    if (status === 'authenticated' && allowedRoles && !allowedRoles.includes(session?.user?.role as string)) {
      router.replace('/dashboard');
    }
  }, [status, isLoading, router, allowedRoles, session]);

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'authenticated') {
    if (!allowedRoles || allowedRoles.includes(session?.user?.role as string)) {
      return <>{children}</>;
    }
  }

  return null;
} 