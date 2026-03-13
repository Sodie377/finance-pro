import React from 'react';

const ExtratoGastos = ({ lista }) => {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</th>
            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Favorecido</th>
            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria</th>
            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Valor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {lista.map((g, i) => (
            <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
              <td className="p-6 text-sm font-bold text-gray-500">
                {new Date(g.data).toLocaleDateString('pt-BR')}
              </td>
              <td className="p-6">
                <p className="text-sm font-black text-slate-800 uppercase">{g.favorecido || 'Não informado'}</p>
              </td>
              <td className="p-6">
                <span className="text-[10px] font-bold px-3 py-1 bg-gray-100 rounded-full text-gray-500 uppercase">
                  {g.categoria || 'Geral'}
                </span>
              </td>
              <td className="p-6 text-right">
                <p className="text-sm font-black text-red-500 font-mono">- R$ {g.valor.toFixed(2)}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExtratoGastos;