'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DefaultPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return null;
} 