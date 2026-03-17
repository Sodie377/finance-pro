import React, { useState } from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  // Estado para controlar a abertura no mobile
  const [isOpen, setIsOpen] = useState(false);

  const menu = [
  { id: 'dash', label: 'Dashboard', icon: '📊' },
  { id: 'vendas', label: 'Vendas', icon: '💰' },
  { id: 'gastos_biz', label: 'Gastos Loja', icon: '🏢' },
  { id: 'gastos_pers', label: 'Gastos Casa', icon: '🏠' },
  { id: 'compras', label: 'Compras', icon: '🛒' }, // <-- NOVO
  { id: 'fornecedores', label: 'Fornecedores', icon: '🤝' },
  { id: 'taxas', label: 'Taxas', icon: '⚙️' },
  { id: 'fechamento', label: 'Fechamento', icon: '📦' },
  { id: 'relatorios', label: 'Relatórios', icon: '📋' }
];

  // Função para mudar de aba e fechar o menu no celular
  const handleTabChange = (id) => {
    setActiveTab(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* BOTÃO MOBILE (Hambúrguer) - Aparece apenas em telas pequenas */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-[100] bg-gray-900 text-white p-3 rounded-xl shadow-lg border border-gray-700"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* OVERLAY (Fundo escuro ao abrir no celular) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed left-0 top-0 h-screen bg-gray-900 text-white shadow-xl z-[50] flex flex-col p-6 transition-transform duration-300 w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        
        {/* LOGO CENTRALIZADA */}
        <div className="flex justify-center mb-10">
          <img 
            src="/logofinancepro.png" 
            alt="Finance PRO" 
            className="h-20 w-auto object-contain" 
          /> 
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto">
          {menu.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === item.id 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Rodapé opcional */}
        <div className="pt-6 border-t border-gray-800 text-[10px] text-gray-500 text-center uppercase tracking-widest font-bold">
          v2.0 Beta
        </div>
      </aside>
    </>
  );
};

export default Sidebar;