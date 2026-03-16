import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    // Aumentamos o z-index para garantir que fique acima de tudo
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      
      {/* 1. Mudamos para max-w-2xl: os novos formulários pedem mais largura
          2. Adicionamos max-h e overflow-y: para o modal não "sumir" se a tela for pequena */}
      <div className="bg-white w-full max-w-2xl my-auto rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        <div className="flex justify-between items-center p-8 border-b border-gray-50 bg-white">
          <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-red-500 text-4xl font-light transition-colors leading-none"
          >
            &times;
          </button>
        </div>

        {/* 3. Colocamos um limite de altura e scroll interno para segurança */}
        <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;