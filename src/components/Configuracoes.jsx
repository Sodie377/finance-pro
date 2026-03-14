import React, { useState } from 'react';
import ConfigTaxas from './ConfigTaxas';
import ConfigCategorias from './ConfigCategorias';

const Configuracoes = () => {
  const [abaAtiva, setAbaAtiva] = useState('taxas');

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* HEADER DAS ABAS (Estilo Chrome/Browser) */}
      <div className="flex items-end gap-2 px-6 mb-[-1px] overflow-x-auto no-scrollbar">
        <button
          onClick={() => setAbaAtiva('taxas')}
          className={`flex items-center gap-2 px-8 py-4 rounded-t-3xl font-black uppercase text-[10px] tracking-widest transition-all ${
            abaAtiva === 'taxas' 
              ? 'bg-white text-emerald-600 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] border-t-4 border-emerald-500' 
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          💳 Taxas e Vínculos
        </button>

        <button
          onClick={() => setAbaAtiva('categorias')}
          className={`flex items-center gap-2 px-8 py-4 rounded-t-3xl font-black uppercase text-[10px] tracking-widest transition-all ${
            abaAtiva === 'categorias' 
              ? 'bg-white text-red-600 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] border-t-4 border-red-500' 
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          📂 Categorias de Gastos
        </button>
      </div>

      {/* CONTEÚDO DA ABA (A moldura branca que conecta com a aba) */}
      <div className="bg-white p-10 rounded-[3rem] rounded-tl-none shadow-xl shadow-slate-200/50 border border-slate-100">
        {abaAtiva === 'taxas' ? (
          <div className="animate-in slide-in-from-left-4 duration-300">
            <ConfigTaxas />
          </div>
        ) : (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <ConfigCategorias />
          </div>
        )}
      </div>

      {/* DICA DE RODAPÉ */}
      <p className="text-center mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
        Configurações do Sistema Finance PRO
      </p>
    </div>
  );
};

export default Configuracoes;