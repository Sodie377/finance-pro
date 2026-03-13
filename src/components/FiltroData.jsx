import React from 'react';

const FiltroData = ({ filtro, setFiltro, customDatas, setCustomDatas }) => {
  const opcoes = [
    { id: 'hoje', label: 'Hoje' },
    { id: '7dias', label: '7 Dias' },
    { id: 'mes', label: 'Este Mês' },
    { id: 'personalizado', label: '📅 Período' },
    { id: 'tudo', label: 'Tudo' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 w-fit">
        {opcoes.map((op) => (
          <button
            key={op.id}
            onClick={() => setFiltro(op.id)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filtro === op.id 
              ? 'bg-slate-800 text-white shadow-md' 
              : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>

      {/* Inputs de Data que só aparecem se 'personalizado' for selecionado */}
      {filtro === 'personalizado' && (
        <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
          <input 
            type="date" 
            className="p-2 rounded-xl border-2 border-gray-100 text-xs font-bold outline-none focus:border-slate-800"
            value={customDatas?.inicio}
            onChange={(e) => setCustomDatas({...customDatas, inicio: e.target.value})}
          />
          <span className="text-gray-400 font-bold text-xs uppercase">até</span>
          <input 
            type="date" 
            className="p-2 rounded-xl border-2 border-gray-100 text-xs font-bold outline-none focus:border-slate-800"
            value={customDatas?.fim}
            onChange={(e) => setCustomDatas({...customDatas, fim: e.target.value})}
          />
        </div>
      )}
    </div>
  );
};

export default FiltroData;