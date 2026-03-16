import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

const GraficoDespesas = ({ gastos }) => {
  if (!gastos || gastos.length === 0) return null;

  // 1. Dados para o gráfico de Pizza (Loja vs Casa)
  const totalLoja = gastos.filter(g => g.tipo === 'Loja').reduce((acc, g) => acc + (g.valor || 0), 0);
  const totalCasa = gastos.filter(g => g.tipo === 'Pessoal').reduce((acc, g) => acc + (g.valor || 0), 0);

  const dadosPizza = [
    { name: 'Loja', value: totalLoja, color: '#ef4444' }, 
    { name: 'Casa', value: totalCasa, color: '#a855f7' } 
  ];

  // 2. LÓGICA DE AGRUPAMENTO POR CATEGORIA (Corrige o erro do gráfico de barras)
  const gastosAgrupados = gastos.reduce((acc, g) => {
    const nomeCat = g.categoria || 'Outros';
    if (!acc[nomeCat]) {
      acc[nomeCat] = 0;
    }
    acc[nomeCat] += Number(g.valor || 0);
    return acc;
  }, {});

  // Transforma o objeto em array para o Recharts e ordena do maior para o menor
  const dadosBarras = Object.keys(gastosAgrupados)
    .map(cat => ({
      categoria: cat,
      valor: gastosAgrupados[cat]
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 6); // Pega as 6 maiores categorias

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
      
      {/* CARD PIZZA */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-[350px]">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 text-center">Distribuição de Gastos</h3>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart>
            <Pie
              data={dadosPizza}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {dadosPizza.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* CARD BARRA */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-[350px]">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 text-center">Top Gastos por Categoria</h3>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={dadosBarras} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="categoria" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              width={80} 
              tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} 
            />
            <Tooltip 
              cursor={{fill: 'transparent'}}
              contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
            />
            <Bar dataKey="valor" fill="#334155" radius={[0, 10, 10, 0]} barSize={15} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

  );
};

export default GraficoDespesas;