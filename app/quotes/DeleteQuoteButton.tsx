'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DeleteQuoteButton({ id, redirect = false }: { id: string; redirect?: boolean }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this quote?')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (redirect) {
          router.push('/quotes');
        } else {
          router.refresh();
        }
      } else {
        alert('Failed to delete quote');
      }
    } catch (error) {
      console.error(error);
      alert('Error deleting quote');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all active:scale-95 disabled:opacity-50 border border-transparent hover:border-red-100 flex items-center justify-center shrink-0"
      aria-label="Delete quote"
      title="Delete Quote"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
