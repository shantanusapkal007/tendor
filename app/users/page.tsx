'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, Shield, User as UserIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';

type AppUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (user?: AppUser) => {
    if (user) {
      setEditingId(user.id);
      setFormData({ name: user.name, email: user.email, role: user.role });
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', role: 'user' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/users/${editingId}` : '/api/users';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save user');

      toast.success(editingId ? 'User updated successfully' : 'User added successfully');
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Users</h1>
          <p className="text-slate-500 mt-1">Manage system access and roles</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 sm:py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm shadow-indigo-200"
        >
          <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
          Add User
        </button>
      </div>

      <div className="bg-transparent sm:bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-slate-200 overflow-hidden">
        <div className="p-0 pb-4 sm:p-4 sm:border-b sm:border-slate-100 sm:bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm sm:shadow-none"
            />
          </div>
        </div>

        <div className="overflow-hidden sm:overflow-x-auto">
          <table className="w-full text-left text-sm block sm:table">
            <thead className="bg-slate-50/80 text-slate-500 font-medium hidden sm:table-header-group">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Added</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-0 sm:divide-y divide-slate-100 block sm:table-row-group">
              {isLoading ? (
                <tr className="block sm:table-row">
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 block sm:table-cell">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr className="block sm:table-row">
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 block sm:table-cell">
                    No users found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group block sm:table-row bg-white p-4 sm:p-0 mb-4 sm:mb-0 rounded-2xl sm:rounded-none shadow-sm sm:shadow-none border border-slate-100 sm:border-0">
                    <td className="px-1 sm:px-6 py-2 sm:py-4 flex justify-between items-center sm:table-cell border-b sm:border-0 border-slate-50">
                      <span className="sm:hidden text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</span>
                      <span className="font-medium text-slate-900">{user.name}</span>
                    </td>
                    <td className="px-1 sm:px-6 py-2 sm:py-4 flex justify-between items-center sm:table-cell border-b sm:border-0 border-slate-50">
                      <span className="sm:hidden text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</span>
                      <span className="text-slate-600">{user.email}</span>
                    </td>
                    <td className="px-1 sm:px-6 py-2 sm:py-4 flex justify-between items-center sm:table-cell border-b sm:border-0 border-slate-50">
                      <span className="sm:hidden text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-1 sm:px-6 py-2 sm:py-4 flex justify-between items-center sm:table-cell border-b sm:border-0 border-slate-50">
                      <span className="sm:hidden text-xs font-semibold text-slate-400 uppercase tracking-wider">Added</span>
                      <span className="text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-1 sm:px-6 py-4 sm:py-4 flex justify-end sm:table-cell mt-2 sm:mt-0">
                      <div className="flex justify-end gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="flex-1 sm:flex-none flex justify-center items-center gap-2 p-2.5 sm:p-1.5 text-slate-600 sm:text-slate-400 bg-slate-50 sm:bg-transparent hover:text-indigo-600 hover:bg-indigo-50 rounded-xl sm:rounded-lg transition-colors font-medium text-sm sm:text-base border border-slate-200 sm:border-0"
                          title="Edit user"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="sm:hidden">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="flex-1 sm:flex-none flex justify-center items-center gap-2 p-2.5 sm:p-1.5 text-slate-600 sm:text-slate-400 bg-slate-50 sm:bg-transparent hover:text-red-600 hover:bg-red-50 rounded-xl sm:rounded-lg transition-colors font-medium text-sm sm:text-base border border-slate-200 sm:border-0"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sm:hidden">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-t-[32px] sm:rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 relative">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full absolute top-2 left-1/2 -translate-x-1/2 sm:hidden"></div>
              <h2 className="text-xl sm:text-lg font-semibold text-slate-900 mt-2 sm:mt-0">
                {editingId ? 'Edit User' : 'Add New User'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 -mr-2 transition-colors mt-2 sm:mt-0 bg-slate-100 sm:bg-transparent rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 sm:py-2 bg-slate-50 sm:bg-white border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 sm:py-2 bg-slate-50 sm:bg-white border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as 'admin' | 'user'})}
                    className="w-full px-4 py-3 sm:py-2 bg-slate-50 sm:bg-white border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 pt-2 flex gap-3 justify-end flex-col-reverse sm:flex-row">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-3.5 sm:py-2.5 text-base sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 sm:bg-transparent rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3.5 sm:py-2.5 rounded-xl text-base sm:text-sm font-semibold transition-all shadow-sm shadow-indigo-200 disabled:opacity-70"
                >
                  {saving ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
