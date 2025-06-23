"use client";

import { useEffect } from 'react';
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
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading && status === 'unauthenticated') {
      router.replace('/login');
    }

    if (status === 'authenticated' && allowedRoles && !allowedRoles.includes(session?.user?.role as string)) {
      router.replace('/dashboard');
    }
  }, [status, loading, router, allowedRoles, session]);

  if (loading || status === 'loading') {
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