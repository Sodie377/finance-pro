import React from 'react';

const ExtratoGastos = ({ lista, onExcluir }) => {
  // Pega a data de hoje no formato YYYY-MM-DD para comparação
  const hoje = new Date().toLocaleDateString('en-CA');

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor || 0);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
      <table className="min-w-[600px] md:min-w-full text-left text-sm">
        <thead className="bg-gray-50/50">
          <tr>
            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</th>
            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Favorecido / Fornecedor</th>
            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria</th>
            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Valor Pago</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {lista.length > 0 ? (
            lista.map((g, i) => (
              <tr key={g.id || i} className="hover:bg-slate-50/80 transition-colors group">
                <td className="p-6">
                  <span className="text-sm font-mono font-bold text-slate-400">
                    {new Date(g.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </td>
                <td className="p-6">
                  <p className="text-sm font-black text-slate-700 uppercase tracking-tight">
                    {g.favorecido || 'Não informado'}
                  </p>
                </td>
                <td className="p-6">
                  <span className="text-[9px] font-black px-3 py-1 bg-slate-100 text-slate-500 rounded-lg border border-slate-200 uppercase">
                    {g.categoria || 'Geral'}
                  </span>
                </td>
                <td className="p-6 text-right relative pr-12">
                  <p className="text-base font-black text-red-500 font-mono">
                    - {formatarMoeda(g.valor)}
                  </p>

                  {/* LIXEIRA: Só aparece se a data do gasto for igual a HOJE */}
                  {g.data === hoje && (
                    <button 
                      onClick={() => onExcluir(g.id, 'despesas')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-red-50 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="Excluir lançamento"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-20 text-center text-slate-400 italic">
                Nenhuma despesa encontrada para este período.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExtratoGastos;