'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Loader2, X, User, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  contactPerson: string | null;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');

  const fetchCustomers = async (query = '') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/customers${query ? `?q=${encodeURIComponent(query)}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingCustomerId ? `/api/customers/${editingCustomerId}` : '/api/customers';
      const method = editingCustomerId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
          contactPerson
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Failed to ${editingCustomerId ? 'update' : 'create'} customer`);
      }

      toast.success(`Customer ${editingCustomerId ? 'updated' : 'created'} successfully`);
      closeModal();
      fetchCustomers(searchQuery);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete customer');
      }
      toast.success('Customer deleted successfully');
      fetchCustomers(searchQuery);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomerId(customer.id);
    setName(customer.name);
    setEmail(customer.email || '');
    setPhone(customer.phone || '');
    setAddress(customer.address || '');
    setContactPerson(customer.contactPerson || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomerId(null);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setContactPerson('');
  };

  return (
    <div className="animate-in px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Customers</h1>
          <p className="text-slate-500 mt-1">Manage your customer database</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 sm:py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm shadow-indigo-200"
        >
          <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
          New Customer
        </button>
      </div>

      <div className="bg-transparent sm:bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-slate-200 overflow-hidden">
        <div className="p-0 pb-4 sm:p-4 sm:border-b sm:border-slate-100 sm:bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Added On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-0 sm:divide-y divide-slate-100 block sm:table-row-group">
              {isLoading ? (
                <tr className="block sm:table-row">
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 block sm:table-cell">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr className="block sm:table-row">
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 block sm:table-cell">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map(customer => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group block sm:table-row bg-white p-4 sm:p-0 mb-4 sm:mb-0 rounded-2xl sm:rounded-none shadow-sm sm:shadow-none border border-slate-100 sm:border-0">
                    <td className="px-1 sm:px-6 py-2 sm:py-4 flex justify-between items-center sm:table-cell border-b sm:border-0 border-slate-50">
                      <span className="sm:hidden text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</span>
                      <div className="flex items-center gap-3 font-medium text-slate-900">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        {customer.name}
                      </div>
                    </td>
                    <td className="px-1 sm:px-6 py-2 sm:py-4 flex justify-between items-center sm:table-cell border-b sm:border-0 border-slate-50">
                      <span className="sm:hidden text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</span>
                      <span className="text-slate-600">{customer.email || '-'}</span>
                    </td>
                    <td className="px-1 sm:px-6 py-2 sm:py-4 flex justify-between items-center sm:table-cell border-b sm:border-0 border-slate-50">
                      <span className="sm:hidden text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</span>
                      <span className="text-slate-600">{customer.phone || '-'}</span>
                    </td>
                    <td className="px-1 sm:px-6 py-2 sm:py-4 flex justify-between items-center sm:table-cell border-b sm:border-0 border-slate-50">
                      <span className="sm:hidden text-xs font-semibold text-slate-400 uppercase tracking-wider">Added On</span>
                      <span className="text-slate-500">
                        {new Date(customer.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-1 sm:px-6 py-4 sm:py-4 flex justify-end sm:table-cell mt-2 sm:mt-0">
                      <div className="flex justify-end gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => openEditModal(customer)}
                          disabled={isDeleting === customer.id}
                          className="flex-1 sm:flex-none flex justify-center items-center gap-2 p-2.5 sm:p-1.5 text-slate-600 sm:text-slate-400 bg-slate-50 sm:bg-transparent hover:text-indigo-600 hover:bg-indigo-50 rounded-xl sm:rounded-lg transition-colors disabled:opacity-50 font-medium text-sm sm:text-base border border-slate-200 sm:border-0"
                          title="Edit Customer"
                        >
                          <Pencil className="w-4 h-4" />
                          <span className="sm:hidden">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          disabled={isDeleting === customer.id}
                          className="flex-1 sm:flex-none flex justify-center items-center gap-2 p-2.5 sm:p-1.5 text-slate-600 sm:text-slate-400 bg-slate-50 sm:bg-transparent hover:text-red-600 hover:bg-red-50 rounded-xl sm:rounded-lg transition-colors disabled:opacity-50 font-medium text-sm sm:text-base border border-slate-200 sm:border-0"
                          title="Delete Customer"
                        >
                          {isDeleting === customer.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
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

      {/* New/Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-t-[32px] sm:rounded-[24px] shadow-xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 relative">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full absolute top-2 left-1/2 -translate-x-1/2 sm:hidden"></div>
              <h2 className="text-xl sm:text-[20px] font-semibold tracking-tight text-slate-900 mt-2 sm:mt-0">
                {editingCustomerId ? 'Edit Customer' : 'New Customer'}
              </h2>
              <button 
                onClick={closeModal}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 sm:bg-transparent hover:bg-slate-200 transition-colors text-slate-500 mt-2 sm:mt-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto">
              <div>
                <label className="block text-sm sm:text-[13px] text-slate-700 mb-1.5 font-semibold sm:font-medium">Customer Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="Company or Individual Name"
                  className="w-full bg-slate-50 sm:bg-[#f5f5f7] border border-slate-200 sm:border-[#e0e0e0] rounded-xl sm:rounded-[11px] p-3 sm:p-3 text-base sm:text-[15px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
                <div>
                  <label className="block text-sm sm:text-[13px] text-slate-700 mb-1.5 font-semibold sm:font-medium">Email</label>
                  <input 
                    type="email"
                    placeholder="email@company.com"
                    className="w-full bg-slate-50 sm:bg-[#f5f5f7] border border-slate-200 sm:border-[#e0e0e0] rounded-xl sm:rounded-[11px] p-3 sm:p-3 text-base sm:text-[15px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm sm:text-[13px] text-slate-700 mb-1.5 font-semibold sm:font-medium">Phone</label>
                  <input 
                    type="tel"
                    placeholder="+91..."
                    className="w-full bg-slate-50 sm:bg-[#f5f5f7] border border-slate-200 sm:border-[#e0e0e0] rounded-xl sm:rounded-[11px] p-3 sm:p-3 text-base sm:text-[15px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-[13px] text-slate-700 mb-1.5 font-semibold sm:font-medium">Address</label>
                <textarea 
                  placeholder="Full address"
                  rows={3}
                  className="w-full bg-slate-50 sm:bg-[#f5f5f7] border border-slate-200 sm:border-[#e0e0e0] rounded-xl sm:rounded-[11px] p-3 sm:p-3 text-base sm:text-[15px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm sm:text-[13px] text-slate-700 mb-1.5 font-semibold sm:font-medium">Kind Attn (Contact Person)</label>
                <input 
                  type="text"
                  placeholder="Mr. / Ms. Name (Optional)"
                  className="w-full bg-slate-50 sm:bg-[#f5f5f7] border border-slate-200 sm:border-[#e0e0e0] rounded-xl sm:rounded-[11px] p-3 sm:p-3 text-base sm:text-[15px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </div>

              <div className="pt-2 sm:pt-4 flex justify-end gap-3 mt-2 flex-col-reverse sm:flex-row">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="w-full sm:w-auto px-5 py-3.5 sm:py-2.5 rounded-xl sm:rounded-full font-semibold text-slate-600 sm:text-[#555] bg-slate-100 sm:bg-transparent hover:bg-slate-200 sm:hover:bg-[#f5f5f7] transition-colors text-base sm:text-[15px]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="w-full sm:w-auto bg-indigo-600 sm:bg-[#0066cc] text-white rounded-xl sm:rounded-full py-3.5 sm:py-2.5 px-6 font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 sm:hover:bg-[#0071e3] transition-all disabled:opacity-50 text-base sm:text-[15px] shadow-sm shadow-indigo-200"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCustomerId ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
