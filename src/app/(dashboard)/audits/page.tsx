'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Audit {
  _id: string;
  client: {
    _id: string;
    name: string;
  };
  date: string;
  conductedBy: {
    _id: string;
    name: string;
  };
  score: number;
  remarks: string;
  status: 'Pending' | 'Completed' | 'Failed';
  checklist: {
    item: string;
    status: 'Pass' | 'Fail' | 'NA';
    comments?: string;
  }[];
  createdAt: string;
  updatedAt: string;
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

  const [form, setForm] = useState({
    client: '',
    date: '',
    score: 0,
    remarks: '',
    status: 'Pending' as const,
    checklist: [] as { item: string; status: 'Pass' | 'Fail' | 'NA'; comments?: string }[],
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
      client: '',
      date: '',
      score: 0,
      remarks: '',
      status: 'Pending',
      checklist: [],
    });
    setFormMode('create');
    setShowForm(true);
    setEditingId(null);
  };

  const openEdit = (audit: Audit) => {
    setForm({
      client: audit.client._id,
      date: new Date(audit.date).toISOString().split('T')[0],
      score: audit.score,
      remarks: audit.remarks,
      status: audit.status,
      checklist: audit.checklist,
    });
    setFormMode('edit');
    setShowForm(true);
    setEditingId(audit._id);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm({
      client: '',
      date: '',
      score: 0,
      remarks: '',
      status: 'Pending',
      checklist: [],
    });
    setEditingId(null);
    setFormError('');
  };

  const addChecklistItem = () => {
    setForm({
      ...form,
      checklist: [
        ...form.checklist,
        { item: '', status: 'NA' as const, comments: '' }
      ]
    });
  };

  const removeChecklistItem = (index: number) => {
    setForm({
      ...form,
      checklist: form.checklist.filter((_, i) => i !== index)
    });
  };

  const updateChecklistItem = (index: number, field: string, value: string) => {
    const newChecklist = [...form.checklist];
    newChecklist[index] = {
      ...newChecklist[index],
      [field]: value
    };
    setForm({
      ...form,
      checklist: newChecklist
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audits</h1>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Audit
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Conducted By
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {audits.map((audit) => (
                <tr key={audit._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {audit.client.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {new Date(audit.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {audit.score}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(audit.status)}`}>
                      {audit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {audit.conductedBy.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEdit(audit)}
                      className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(audit._id)}
                      className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {formMode === 'create' ? 'Create Audit' : 'Edit Audit'}
            </h2>
            
            {formError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Client ID
                </label>
                <input
                  type="text"
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.score}
                  onChange={(e) => setForm({ ...form, score: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Remarks
                </label>
                <textarea
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'Pending' | 'Completed' | 'Failed' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Checklist
                  </label>
                  <button
                    type="button"
                    onClick={addChecklistItem}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    + Add Item
                  </button>
                </div>
                {form.checklist.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item.item}
                      onChange={(e) => updateChecklistItem(index, 'item', e.target.value)}
                      placeholder="Checklist item"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <select
                      value={item.status}
                      onChange={(e) => updateChecklistItem(index, 'status', e.target.value)}
                      className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                      <option value="NA">N/A</option>
                    </select>
                    <input
                      type="text"
                      value={item.comments || ''}
                      onChange={(e) => updateChecklistItem(index, 'comments', e.target.value)}
                      placeholder="Comments"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(index)}
                      className="text-red-600 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : formMode === 'create' ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 