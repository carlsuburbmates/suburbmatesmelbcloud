import React, { FC, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <dialog
      className="fixed inset-0 z-50 w-full h-full bg-transparent p-0 m-0 backdrop:bg-ink/30 backdrop:backdrop-blur-sm flex items-center justify-center"
      open={isOpen}
      onClick={onClose}
    >
      <div
        className="bg-white w-[90%] max-w-md rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[80vh] modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-line flex justify-between items-center bg-gray-50/50">
          <h3 className="type-display text-2xl text-ink">{title}</h3>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-xl">
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>
      </div>
    </dialog>
  );
};

export default Modal;