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
    <div className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-[#111]">Customers</h1>
          <p className="text-[#7a7a7a] mt-1">Manage your customer database</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0066cc] text-white rounded-full py-2.5 px-6 font-semibold text-[14px] hover:bg-[#0071e3] transition-all flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Customer
        </button>
      </div>

      <div className="bg-white border border-[#e0e0e0] rounded-[18px] shadow-[0_5px_30px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#e0e0e0] bg-[#fafafc]">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7a7a7a] w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#e0e0e0] rounded-full py-2.5 pl-10 pr-4 text-[14px] outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e0e0e0] bg-white">
                <th className="py-4 px-6 text-[13px] font-semibold text-[#7a7a7a] whitespace-nowrap">Name</th>
                <th className="py-4 px-6 text-[13px] font-semibold text-[#7a7a7a] whitespace-nowrap">Email</th>
                <th className="py-4 px-6 text-[13px] font-semibold text-[#7a7a7a] whitespace-nowrap">Phone</th>
                <th className="py-4 px-6 text-[13px] font-semibold text-[#7a7a7a] whitespace-nowrap">Added On</th>
                <th className="py-4 px-6 text-[13px] font-semibold text-[#7a7a7a] text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#7a7a7a]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#7a7a7a]">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map(customer => (
                  <tr key={customer.id} className="hover:bg-[#fafafc] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#f0f5ff] text-[#0066cc] flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-[#111]">{customer.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[#555] text-[14px]">{customer.email || '-'}</td>
                    <td className="py-4 px-6 text-[#555] text-[14px]">{customer.phone || '-'}</td>
                    <td className="py-4 px-6 text-[#7a7a7a] text-[14px]">
                      {new Date(customer.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(customer)}
                          disabled={isDeleting === customer.id}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#7a7a7a] hover:text-[#0066cc] hover:bg-[#f0f5ff] transition-all disabled:opacity-50"
                          title="Edit Customer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          disabled={isDeleting === customer.id}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#7a7a7a] hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                          title="Delete Customer"
                        >
                          {isDeleting === customer.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-[#f0f0f0]">
              <h2 className="text-[20px] font-semibold tracking-tight">
                {editingCustomerId ? 'Edit Customer' : 'New Customer'}
              </h2>
              <button 
                onClick={closeModal}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f5f5f7] transition-colors text-[#7a7a7a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-[13px] text-[#7a7a7a] mb-1.5 font-medium">Customer Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="Company or Individual Name"
                  className="w-full bg-[#f5f5f7] border border-[#e0e0e0] rounded-[11px] p-3 text-[15px] outline-none focus:ring-2 focus:ring-[#0066cc] transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] text-[#7a7a7a] mb-1.5 font-medium">Email</label>
                  <input 
                    type="email"
                    placeholder="email@company.com"
                    className="w-full bg-[#f5f5f7] border border-[#e0e0e0] rounded-[11px] p-3 text-[15px] outline-none focus:ring-2 focus:ring-[#0066cc] transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-[#7a7a7a] mb-1.5 font-medium">Phone</label>
                  <input 
                    type="tel"
                    placeholder="+91..."
                    className="w-full bg-[#f5f5f7] border border-[#e0e0e0] rounded-[11px] p-3 text-[15px] outline-none focus:ring-2 focus:ring-[#0066cc] transition-all"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] text-[#7a7a7a] mb-1.5 font-medium">Address</label>
                <textarea 
                  placeholder="Full address"
                  rows={3}
                  className="w-full bg-[#f5f5f7] border border-[#e0e0e0] rounded-[11px] p-3 text-[15px] outline-none focus:ring-2 focus:ring-[#0066cc] transition-all resize-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-[13px] text-[#7a7a7a] mb-1.5 font-medium">Kind Attn (Contact Person)</label>
                <input 
                  type="text"
                  placeholder="Mr. / Ms. Name (Optional)"
                  className="w-full bg-[#f5f5f7] border border-[#e0e0e0] rounded-[11px] p-3 text-[15px] outline-none focus:ring-2 focus:ring-[#0066cc] transition-all"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-2">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-full font-semibold text-[#555] hover:bg-[#f5f5f7] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="bg-[#0066cc] text-white rounded-full py-2.5 px-6 font-semibold flex items-center gap-2 hover:bg-[#0071e3] transition-all disabled:opacity-50"
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
