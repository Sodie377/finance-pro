import React from 'react';

const ExtratoGastos = ({ lista }) => {
  // Função para formatar moeda
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor || 0);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
      <table className="w-full text-left border-collapse">
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
              <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                <td className="p-6">
                  {/* Corrigido o fuso horário da data */}
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
                <td className="p-6 text-right">
                  <p className="text-base font-black text-red-500 font-mono">
                    - {formatarMoeda(g.valor)}
                  </p>
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