import React from 'react';

const ExtratoVendas = ({ lista }) => {
  return (
    <div className="w-full mt-10 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-700 uppercase text-sm tracking-widest">📋 Extrato de Faturamento</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-[10px]">
            <tr>
              <th className="p-4">Data</th>
              <th className="p-4">Dinheiro</th>
              <th className="p-4">Pix</th>
              <th className="p-4">Apps (iF/Ke)</th>
              <th className="p-4">Outros</th>
              <th className="p-4 bg-emerald-50 text-emerald-700 text-right">Total Bruto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lista.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium">{new Date(item.data_referencia + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                <td className="p-4 text-green-600">R$ {item.dinheiro.toFixed(2)}</td>
                <td className="p-4 text-emerald-600">R$ {item.pix.toFixed(2)}</td>
                <td className="p-4 text-red-500">R$ {(item.ifood + item.keeta).toFixed(2)}</td>
                <td className="p-4 text-gray-500">R$ {(item.pix_ecommerce + item.voucher + item.debito + item.credito).toFixed(2)}</td>
                <td className="p-4 text-right font-black bg-emerald-50 text-emerald-800">
                  R$ {item.valor_bruto.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExtratoVendas;