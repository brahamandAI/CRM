"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Client {
  id: string;
  name: string;
  contact: string;
  contractPeriod: string;
  status: 'Active' | 'Inactive' | 'Pending';
}

export default function ClientsPage() {
  const { data: session } = useSession();
  const [sortField, setSortField] = useState<keyof Client>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Omit<Client, 'id'>>({
    name: '',
    contact: '',
    contractPeriod: '',
    status: 'Active'
  });

  const [clients, setClients] = useState<Client[]>([]);

  // Fetch clients
  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/clients');
      if (!res.ok) {
        throw new Error('Failed to fetch clients');
      }
      const data = await res.json();
      setClients(data);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSort = (field: keyof Client) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }

    const sortedClients = [...clients].sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });

    setClients(sortedClients);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const openCreate = () => {
    setForm({
      name: '',
      contact: '',
      contractPeriod: '',
      status: 'Active'
    });
    setFormMode('create');
    setShowForm(true);
    setEditingId(null);
  };

  const openEdit = (client: Client) => {
    setForm({
      name: client.name,
      contact: client.contact,
      contractPeriod: client.contractPeriod,
      status: client.status
    });
    setFormMode('edit');
    setShowForm(true);
    setEditingId(client.id);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm({
      name: '',
      contact: '',
      contractPeriod: '',
      status: 'Active'
    });
    setEditingId(null);
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formMode === 'create') {
      const newClient = {
        ...form,
        id: Math.random().toString(36).substr(2, 9)
      };
      setClients([...clients, newClient]);
    } else if (editingId) {
      setClients(clients.map(client => 
        client.id === editingId ? { ...form, id: editingId } : client
      ));
    }
    closeForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients(clients.filter(client => client.id !== id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Clients
        </h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={openCreate}
        >
          Add Client
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Name
                {sortField === 'name' && (
                  <span className="ml-2">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('contact')}
              >
                Contact
                {sortField === 'contact' && (
                  <span className="ml-2">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('contractPeriod')}
              >
                Contract Period
                {sortField === 'contractPeriod' && (
                  <span className="ml-2">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Status
                {sortField === 'status' && (
                  <span className="ml-2">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {client.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {client.contact}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {client.contractPeriod}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(client.status)}`}>
                    {client.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    className="text-blue-400 hover:text-blue-300 mr-4"
                    onClick={() => openEdit(client)}
                  >
                    Edit
                  </button>
                  <button 
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(client.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {formMode === 'create' ? 'Add New Client' : 'Edit Client'}
            </h2>
            
            {formError && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Contact
                </label>
                <input
                  type="text"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Contract Period
                </label>
                <input
                  type="text"
                  value={form.contractPeriod}
                  onChange={(e) => setForm({ ...form, contractPeriod: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  required
                  placeholder="YYYY-YYYY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Client['status'] })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                >
                  {formMode === 'create' ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 