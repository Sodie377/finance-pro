import React from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Bar, Line, ComposedChart 
} from 'recharts';

const GraficoEvolucao = ({ vendas, taxas }) => {
  // 1. Proteção: Se não houver dados, exibe um placeholder elegante
  if (!vendas || vendas.length === 0) {
    return (
      <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center mt-8 min-h-[300px]">
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
      const dataObj = new Date(dia.data_referencia);
      const dataFormatada = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      if (!mapa[dataFormatada]) {
        mapa[dataFormatada] = { name: dataFormatada, Bruto: 0, Liquido: 0, rawDate: dataObj };
      }

      // Cálculo do líquido para este lançamento específico
      let liquidoLancamento = 0;
      const colunas = [
        { campo: 'dinheiro', nome: 'Dinheiro' }, { campo: 'debito', nome: 'Debito' },
        { campo: 'credito', nome: 'Credito' }, { campo: 'pix', nome: 'Pix' },
        { campo: 'pix_ecommerce', nome: 'Pix E-commerce' }, { campo: 'voucher', nome: 'Voucher' },
        { campo: 'ifood', nome: 'iFood' }, { campo: 'keeta', nome: 'Keeta' }
      ];

      colunas.forEach(col => {
        const valorBruto = dia[col.campo] || 0;
        const conf = taxas.find(t => t.nome_metodo.toLowerCase() === col.nome.toLowerCase());
        if (conf) {
          liquidoLancamento += valorBruto - (valorBruto * (conf.taxa_percentual / 100)) - (valorBruto > 0 ? conf.taxa_fixa : 0);
        } else {
          liquidoLancamento += valorBruto;
        }
      });

      mapa[dataFormatada].Bruto += dia.valor_bruto || 0;
      mapa[dataFormatada].Liquido += liquidoLancamento;
    });

    // Converte para array e ordena cronologicamente
    return Object.values(mapa).sort((a, b) => a.rawDate - b.rawDate);
  };

  const dataFormatada = agruparPorData();

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 w-full mt-8 animate-in fade-in zoom-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Evolução de Faturamento</h3>
        <div className="flex gap-4 text-[10px] font-bold uppercase">
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Bruto</span>
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> Líquido</span>
        </div>
      </div>

      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
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