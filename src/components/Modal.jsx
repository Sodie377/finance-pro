import React from 'react';

// Este é o componente genérico que cria a caixa flutuante
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-black text-gray-800 uppercase">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-3xl font-light">&times;</button>
        </div>
        <div className="p-6">
          {children} {/* Aqui é onde os formulários vão "entrar" */}
        </div>
      </div>
    </div>
  );
};

export default Modal;