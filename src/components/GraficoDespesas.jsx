import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const GraficoDespesas = ({ gastos }) => {
  if (!gastos || gastos.length === 0) return null;

  // 1. Dados para o gráfico de Pizza (Loja vs Casa)
  const totalLoja = gastos.filter(g => g.tipo === 'Loja').reduce((acc, g) => acc + g.valor, 0);
  const totalCasa = gastos.filter(g => g.tipo === 'Pessoal').reduce((acc, g) => acc + g.valor, 0);

  const dadosPizza = [
    { name: 'Loja', value: totalLoja, color: '#ef4444' }, // Vermelho
    { name: 'Casa', value: totalCasa, color: '#a855f7' }  // Roxo
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
      
      {/* CARD PIZZA - DISTRIBUIÇÃO */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 text-center">Distribuição de Gastos</h3>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
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
                formatter={(value) => `R$ ${value.toFixed(2)}`}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CARD BARRA - CATEGORIAS */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 text-center">Top Gastos por Categoria</h3>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={gastos.slice(0, 5)} layout="vertical" margin={{left: -20}}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis dataKey="categoria" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="valor" fill="#334155" radius={[0, 10, 10, 0]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GraficoDespesas;