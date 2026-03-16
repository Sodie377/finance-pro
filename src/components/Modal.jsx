import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    // 1. Mudamos para items-start e p-4 para o modal ter margem e respirar
    <div className="fixed inset-0 z-[999] flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      
      {/* 2. O my-auto aqui ajuda a centralizar quando cabe, mas permite subir quando não cabe */}
      <div className="bg-white w-full max-w-2xl my-auto rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* 3. Cabeçalho fixo (sticky) para o X nunca sumir ao rolar */}
        <div className="flex justify-between items-center p-8 border-b border-gray-50 bg-white sticky top-0 z-20">
          <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-red-500 text-4xl font-light transition-colors leading-none"
          >
            &times;
          </button>
        </div>

        {/* 4. Conteúdo: removemos o max-h fixo aqui e deixamos o container de fora (item 1) resolver o scroll da tela inteira */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;