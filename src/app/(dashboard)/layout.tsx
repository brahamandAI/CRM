"use client";

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
      <Navbar />
      <main className="pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto py-6">
          {children}
        </div>
      </main>
    </div>
  );
} 