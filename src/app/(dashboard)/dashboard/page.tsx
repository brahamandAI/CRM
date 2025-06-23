"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    totalGuards: 0,
    totalClients: 0,
    activeIncidents: 0,
    pendingAudits: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only fetch stats when session is authenticated
    if (status === 'authenticated') {
      const fetchStats = async () => {
        setLoading(true);
        setError('');
        try {
          const [guardsRes, clientsRes, incidentsRes, auditsRes] = await Promise.all([
            fetch('/api/guards'),
            fetch('/api/clients'),
            fetch('/api/incidents'),
            fetch('/api/audits')
          ]);

          // Check if any response is not ok
          if (!guardsRes.ok || !clientsRes.ok || !incidentsRes.ok || !auditsRes.ok) {
            throw new Error('Failed to fetch some data');
          }

          const [guards, clients, incidents, audits] = await Promise.all([
            guardsRes.json(),
            clientsRes.json(),
            incidentsRes.json(),
            auditsRes.json()
          ]);

          setStats({
            totalGuards: guards.length || 0,
            totalClients: clients.length || 0,
            activeIncidents: incidents.filter((i: any) => i.status === 'Active').length || 0,
            pendingAudits: audits.filter((a: any) => a.status === 'Pending').length || 0
          });
        } catch (error: any) {
          console.error('Error fetching dashboard stats:', error);
          setError('Failed to load dashboard data. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      fetchStats();
    }
  }, [status]); // Only re-run when session status changes

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Welcome back, {session?.user?.name}
        </h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Guards</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-600">{stats.totalGuards}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clients</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">{stats.totalClients}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Incidents</h3>
            <p className="mt-2 text-3xl font-semibold text-red-600">{stats.activeIncidents}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Audits</h3>
            <p className="mt-2 text-3xl font-semibold text-yellow-600">{stats.pendingAudits}</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/guards'}
            className="p-4 text-center rounded-lg bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/70 transition-colors"
            disabled={loading}
          >
            <h3 className="font-medium text-blue-700 dark:text-blue-300">Manage Guards</h3>
          </button>
          <button 
            onClick={() => window.location.href = '/clients'}
            className="p-4 text-center rounded-lg bg-green-50 dark:bg-green-900/50 hover:bg-green-100 dark:hover:bg-green-900/70 transition-colors"
            disabled={loading}
          >
            <h3 className="font-medium text-green-700 dark:text-green-300">View Clients</h3>
          </button>
          <button 
            onClick={() => window.location.href = '/incidents'}
            className="p-4 text-center rounded-lg bg-red-50 dark:bg-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/70 transition-colors"
            disabled={loading}
          >
            <h3 className="font-medium text-red-700 dark:text-red-300">Report Incident</h3>
          </button>
          <button 
            onClick={() => window.location.href = '/audits'}
            className="p-4 text-center rounded-lg bg-yellow-50 dark:bg-yellow-900/50 hover:bg-yellow-100 dark:hover:bg-yellow-900/70 transition-colors"
            disabled={loading}
          >
            <h3 className="font-medium text-yellow-700 dark:text-yellow-300">Schedule Audit</h3>
          </button>
        </div>
      </div>
    </div>
  );
} 