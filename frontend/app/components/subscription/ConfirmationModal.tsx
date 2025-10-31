'use client';
import { useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Yes',
  cancelText = 'No',
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      onKeyDown={handleKeyDown}
    >
      <div
        ref={modalRef}
        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl p-4 sm:p-6 max-w-md w-full mx-4"
        tabIndex={-1}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 id="confirmation-modal-title" className="text-xl font-semibold text-white flex items-center gap-2">
            <X className="w-6 h-6 text-red-500" />
            {title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-300 mb-6">{message}</p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            <X className="w-4 h-4" />
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            <Check className="w-4 h-4" />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
