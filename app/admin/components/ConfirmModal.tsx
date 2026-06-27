'use client';

import { useEffect, useRef } from 'react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      // Focus the confirm button when the modal opens
      setTimeout(() => confirmRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
        <p className="mt-2 text-sm text-zinc-500">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-zinc-800 hover:bg-zinc-900'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
