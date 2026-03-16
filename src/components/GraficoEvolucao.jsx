import React from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Bar, Line, ComposedChart 
} from 'recharts';

const GraficoEvolucao = ({ vendas, taxas }) => {
  // 1. Proteção: Se não houver dados, exibe um placeholder elegante
  if (!vendas || vendas.length === 0) {
    return (
      <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center mt-8 h-[350px]">
        <span className="text-4xl mb-3">📈</span>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Aguardando dados para o gráfico...</p>
      </div>
    );
  }

  // 2. Lógica de agrupamento por data corrigida
  const agruparPorData = () => {
    const mapa = {};

    vendas.forEach(dia => {
      // Formata a data para agrupar (ex: "13/03")
      const dataObj = new Date(dia.data_referencia + 'T00:00:00');
      const dataFormatada = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      if (!mapa[dataFormatada]) {
        mapa[dataFormatada] = { name: dataFormatada, Bruto: 0, Liquido: 0, rawDate: dataObj };
      }

      // Inicia o cálculo do líquido com BOLOS (que não têm taxa)
      let liquidoLancamento = dia.bolos || 0;
      
      // Lista exata das chaves que usamos no banco
      const colunas = [
        'dinheiro', 'debito', 'credito', 'pix', 
        'pix_ecommerce', 'voucher', 'ifood', 'keeta'
      ];

      colunas.forEach(campo => {
        const valorBruto = dia[campo] || 0;
        // Busca a taxa pelo campo 'vinculo' para bater com o cadastro de taxas
        const conf = taxas.find(t => t.vinculo === campo);
        
        if (conf && valorBruto > 0 && campo !== 'dinheiro') {
          liquidoLancamento += valorBruto - (valorBruto * (conf.taxa_percentual / 100)) - (conf.taxa_fixa || 0);
        } else {
          liquidoLancamento += valorBruto;
        }
      });

      // Bruto Real = Valor Bruto Oficial + Bolos
      mapa[dataFormatada].Bruto += (dia.valor_bruto || 0) + (dia.bolos || 0);
      mapa[dataFormatada].Liquido += liquidoLancamento;
    });

    // Converte para array e ordena cronologicamente
    return Object.values(mapa).sort((a, b) => a.rawDate - b.rawDate);
  };

  const dataFormatada = agruparPorData();

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 w-full mt-8 animate-in fade-in zoom-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Evolução de Faturamento</h3>
           <p className="text-[9px] text-emerald-500 font-bold uppercase mt-1">Soma de Oficial + Bolos</p>
        </div>
        <div className="flex gap-4 text-[10px] font-bold uppercase">
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Bruto</span>
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> Líquido</span>
        </div>
      </div>

      {/* Ajuste de altura e overflow para evitar erro de width -1 */}
      <div className="h-[350px] w-full min-h-0 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <ComposedChart data={dataFormatada} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 10, fontWeight: '700', fill: '#94a3b8'}} 
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 10, fontWeight: '700', fill: '#94a3b8'}}
            />
            <Tooltip 
              cursor={{fill: '#f8fafc'}}
              contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
              itemStyle={{ fontSize: '12px', fontWeight: '800' }}
              labelStyle={{ marginBottom: '5px', color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' }}
              formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            />
            <Bar 
              dataKey="Bruto" 
              fill="#10b981" 
              radius={[6, 6, 0, 0]} 
              barSize={20} 
              animationDuration={1500}
            />
            <Line 
              type="monotone" 
              dataKey="Liquido" 
              stroke="#06b6d4" 
              strokeWidth={4} 
              dot={{ r: 4, fill: '#06b6d4', strokeWidth: 2, stroke: '#fff' }} 
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={2000}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GraficoEvolucao;