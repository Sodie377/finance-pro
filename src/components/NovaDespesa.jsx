import React, { useState } from 'react';

const NovaDespesa = ({ tipoPadrao, onSalvar }) => {
  const [form, setForm] = useState({ 
    tipo: tipoPadrao, // 'Loja' ou 'Pessoal' vem automático agora
    categoria: tipoPadrao === 'Loja' ? 'Insumos' : 'Moradia', 
    valor: '', 
    descricao: '' 
  });
  
  // O restante do seu código de formulário que já funciona...
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border-t-4 border-red-500">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">💸 Lançar Despesa</h2>
      
      <div className="space-y-4">
        {/* Seletor Loja vs Casa */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${form.tipo === 'Loja' ? 'bg-red-500 text-white shadow' : 'text-gray-500'}`}
            onClick={() => setForm({...form, tipo: 'Loja', categoria: 'Insumos'})}
          >Loja</button>
          <button 
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${form.tipo === 'Pessoal' ? 'bg-purple-500 text-white shadow' : 'text-gray-500'}`}
            onClick={() => setForm({...form, tipo: 'Pessoal', categoria: 'Casa'})}
          >Pessoal (Casa)</button>
        </div>

        {/* Categoria Dinâmica */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Categoria</label>
          <select 
            className="w-full p-3 border-2 border-gray-100 rounded-xl outline-none focus:border-red-400"
            value={form.categoria}
            onChange={(e) => setForm({...form, categoria: e.target.value})}
          >
            {form.tipo === 'Loja' ? (
              <>
                <option value="Insumos">Insumos (Matéria Prima)</option>
                <option value="Fixo">Despesas Fixas (Aluguel, Luz)</option>
                <option value="Outros">Outros Negócio</option>
              </>
            ) : (
              <>
                <option value="Financiamento">Financiamento</option>
                <option value="Mercado">Mercado/Casa</option>
                <option value="Lazer">Lazer/Pessoal</option>
              </>
            )}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Valor (R$)</label>
          <input type="number" className="w-full p-3 border-2 border-gray-100 rounded-xl outline-none focus:border-red-400" 
            placeholder="0,00" onChange={(e) => setForm({...form, valor: Number(e.target.value)})} />
        </div>

        <button 
          onClick={() => onSalvar(form)}
          className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${form.tipo === 'Loja' ? 'bg-red-500' : 'bg-purple-500'}`}
        >
          Salvar Gasto
        </button>
      </div>
    </div>
  );
};

export default NovaDespesa;