'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Audit {
  _id: string;
  supervisor: {
    _id: string;
    name: string;
  };
  client: {
    _id: string;
    name: string;
  };
  date: string;
  feedback?: string;
  score?: number;
  findings?: string;
  actions?: string;
  attachments: string[];
}

export default function AuditsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState<{
    supervisor: string;
    client: string;
    date: string;
    feedback?: string;
    score?: number;
    findings?: string;
    actions?: string;
    attachments: string[];
  }>({
    supervisor: '',
    client: '',
    date: new Date().toISOString().split('T')[0],
    feedback: '',
    score: undefined,
    findings: '',
    actions: '',
    attachments: [],
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchAudits = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/audits');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch audits');
      setAudits(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchAudits();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFormError('');
    try {
      const method = formMode === 'create' ? 'POST' : 'PUT';
      const url = formMode === 'create'
        ? '/api/audits'
        : `/api/audits/${editingId}`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save audit');
      closeForm();
      fetchAudits();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this audit?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/audits/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete audit');
      fetchAudits();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openCreate = () => {
    setForm({
      supervisor: '',
      client: '',
      date: new Date().toISOString().split('T')[0],
      feedback: '',
      score: undefined,
      findings: '',
      actions: '',
      attachments: [],
    });
    setFormMode('create');
    setShowForm(true);
    setEditingId(null);
  };

  const openEdit = (audit: Audit) => {
    setForm({
      supervisor: audit.supervisor._id,
      client: audit.client._id,
      date: new Date(audit.date).toISOString().split('T')[0],
      feedback: audit.feedback,
      score: audit.score,
      findings: audit.findings,
      actions: audit.actions,
      attachments: audit.attachments,
    });
    setFormMode('edit');
    setShowForm(true);
    setEditingId(audit._id);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm({
      supervisor: '',
      client: '',
      date: new Date().toISOString().split('T')[0],
      feedback: '',
      score: undefined,
      findings: '',
      actions: '',
      attachments: [],
    });
    setEditingId(null);
    setFormError('');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Audits</h1>
          {session?.user?.role === 'Admin' && (
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              disabled={actionLoading}
            >
              Add Audit
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Supervisor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Findings</th>
                {session?.user?.role === 'Admin' && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {audits.map((audit) => (
                <tr key={audit._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {new Date(audit.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{audit.supervisor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{audit.client.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{audit.score || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {audit.findings
                      ? audit.findings.length > 100
                        ? `${audit.findings.substring(0, 100)}...`
                        : audit.findings
                      : 'N/A'}
                  </td>
                  {session?.user?.role === 'Admin' && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEdit(audit)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        disabled={actionLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(audit._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        disabled={actionLoading}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {formMode === 'create' ? 'Add New Audit' : 'Edit Audit'}
            </h2>
            
            {formError && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Score</label>
                <input
                  type="number"
                  value={form.score || ''}
                  onChange={(e) => setForm({ ...form, score: e.target.value ? Number(e.target.value) : undefined })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  min={0}
                  max={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Feedback</label>
                <textarea
                  value={form.feedback}
                  onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Findings</label>
                <textarea
                  value={form.findings}
                  onChange={(e) => setForm({ ...form, findings: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Actions</label>
                <textarea
                  value={form.actions}
                  onChange={(e) => setForm({ ...form, actions: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 