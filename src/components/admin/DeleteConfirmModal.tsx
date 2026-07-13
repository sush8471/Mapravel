'use client';

import { Loader2, AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  title: string;
  message: string;
  itemName?: string;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  title,
  message,
  itemName,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111116] border border-white/10 rounded-2xl max-w-md w-full p-8 space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-white/40 leading-relaxed">
            {itemName ? (
              <>
                This will permanently delete <span className="text-white font-medium">{itemName}</span>. {message}
              </>
            ) : (
              message
            )}
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
