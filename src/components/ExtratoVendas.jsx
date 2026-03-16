import React from 'react';

const ExtratoVendas = ({ lista, taxas, onExcluir }) => {
  // Pega a data de hoje no formato YYYY-MM-DD para a trava de exclusão
  const hoje = new Date().toLocaleDateString('en-CA');

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor || 0);
  };

  const calcularLiquidoDia = (item) => {
    let liquido = 0;
    // Soma Dinheiro e Bolos (sem taxas)
    liquido += (item.dinheiro || 0) + (item.bolos || 0);

    // Lista de campos para calcular com taxa
    const camposTaxados = [
      { id: 'debito', vinculo: 'debito' },
      { id: 'credito', vinculo: 'credito' },
      { id: 'pix', vinculo: 'pix' },
      { id: 'pix_ecommerce', vinculo: 'pix_ecommerce' },
      { id: 'voucher', vinculo: 'voucher' },
      { id: 'ifood', vinculo: 'ifood' },
      { id: 'keeta', vinculo: 'keeta' },
    ];

    camposTaxados.forEach(c => {
      const valor = item[c.id] || 0;
      const conf = taxas?.find(t => t.vinculo === c.vinculo);
      if (conf && valor > 0) {
        liquido += valor - (valor * (conf.taxa_percentual / 100)) - (conf.taxa_fixa || 0);
      } else {
        liquido += valor;
      }
    });
    return liquido;
  };

  return (
    <div className="w-full mt-10 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-in fade-in duration-500">
      <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-bold text-gray-700 uppercase text-sm tracking-widest">📋 Extrato de Faturamento</h3>
        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase">🧁 Inclui Vendas Internas</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-[10px]">
            <tr>
              <th className="p-4 border-r border-gray-200">Data</th>
              <th className="p-4">Dinheiro</th>
              <th className="p-4">Pix</th>
              <th className="p-4">Apps (iF/Ke)</th>
              <th className="p-4 text-purple-600 bg-purple-50">🧁 Bolos</th>
              <th className="p-4">Outros</th>
              <th className="p-4 bg-emerald-50 text-emerald-700 text-right">Líquido Real</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lista.map((item) => {
              const liquido = calcularLiquidoDia(item);
              const appsTotal = (item.ifood || 0) + (item.keeta || 0);
              const outrosTotal = (item.pix_ecommerce || 0) + (item.voucher || 0) + (item.debito || 0) + (item.credito || 0);
              const brutoTotalReal = (item.valor_bruto || 0) + (item.bolos || 0);

              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4 font-bold text-gray-500 border-r border-gray-100">
                    {new Date(item.data_referencia + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4 text-green-600 font-medium">{formatarMoeda(item.dinheiro)}</td>
                  <td className="p-4 text-emerald-600 font-medium">{formatarMoeda(item.pix)}</td>
                  <td className="p-4 text-red-500 font-medium">{formatarMoeda(appsTotal)}</td>
                  
                  <td className="p-4 bg-purple-50 text-purple-700 font-black">
                    {formatarMoeda(item.bolos)}
                  </td>

                  <td className="p-4 text-gray-500 font-medium">{formatarMoeda(outrosTotal)}</td>
                  
                  <td className="p-4 text-right bg-emerald-50 relative pr-12">
                    <div className="flex flex-col items-end">
                      <span className="font-black text-emerald-800 text-base">{formatarMoeda(liquido)}</span>
                      <span className="text-[9px] font-bold text-emerald-600 uppercase">Bruto: {formatarMoeda(brutoTotalReal)}</span>
                    </div>

                    {/* BOTÃO EXCLUIR: Só aparece se a data_referencia for HOJE */}
                    {item.data_referencia === hoje && (
                      <button 
                        onClick={() => onExcluir(item.id, 'faturamento_diario')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-red-50 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title="Excluir lançamento"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExtratoVendas;