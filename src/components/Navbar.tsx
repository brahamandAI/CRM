"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import {
  HomeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  BellIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Clients', href: '/clients', icon: UserGroupIcon },
  { name: 'Guards', href: '/guards', icon: ShieldCheckIcon },
  { name: 'Incidents', href: '/incidents', icon: ExclamationTriangleIcon },
  { name: 'Training', href: '/training', icon: AcademicCapIcon },
  { name: 'Audits', href: '/audits', icon: ClipboardDocumentCheckIcon },
  { name: 'Alerts', href: '/alerts', icon: BellIcon },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white w-64 fixed left-0 top-0 flex flex-col">
      {/* Logo Section */}
      <div className="p-4 flex items-center space-x-2">
        <div className="text-xl font-bold">Rakshak Securitas</div>
        <button
          onClick={toggleDarkMode}
          className="ml-auto p-2 rounded-lg hover:bg-gray-800"
        >
          {isDarkMode ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            {session?.user?.name?.[0] || 'U'}
          </div>
          <div>
            <div className="font-medium">{session?.user?.name || 'User'}</div>
            <div className="text-sm text-gray-400">{session?.user?.role || 'Role'}</div>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
} 