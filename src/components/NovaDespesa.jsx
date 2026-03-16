import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const NovaDespesa = ({ tipoPadrao, onSalvar }) => {
  const [form, setForm] = useState({ 
    tipo: tipoPadrao || 'Loja',
    categoria: '', 
    valor: '', 
    favorecido: '',
    data: new Date().toISOString().split('T')[0] // Data atual por padrão
  });
  
  const [categoriasBD, setCategoriasBD] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  // Carrega categorias e fornecedores ao iniciar
  useEffect(() => {
    const carregarDados = async () => {
      const [resCat, resForn] = await Promise.all([
        supabase.from('categorias_gastos').select('nome').order('nome'),
        supabase.from('fornecedores').select('nome').order('nome')
      ]);
      if (resCat.data) setCategoriasBD(resCat.data);
      if (resForn.data) setFornecedores(resForn.data.map(f => f.nome));
    };
    carregarDados();
  }, []);

  const handleSubmit = async () => {
    if (!form.valor || !form.favorecido) return alert("Preencha o valor e o favorecido!");

    // Verifica se o fornecedor existe, senão cadastra automático
    const existe = fornecedores.some(f => f.toLowerCase() === form.favorecido.toLowerCase());
    if (!existe) {
      await supabase.from('fornecedores').insert([{ nome: form.favorecido, tipo: form.tipo }]);
    }

    onSalvar({
      ...form,
      valor: parseFloat(form.valor),
      categoria: form.categoria || 'Outros'
    });

    // Limpa o valor e favorecido após salvar
    setForm({ ...form, valor: '', favorecido: '' });
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 max-w-md mx-auto animate-in fade-in duration-500">
      <h2 className="text-xl font-black mb-6 text-gray-800 uppercase tracking-tighter italic">💸 Lançar Despesa</h2>
      
      <div className="space-y-5">
        {/* Seletor Loja vs Casa */}
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button 
            className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${form.tipo === 'Loja' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'}`}
            onClick={() => setForm({...form, tipo: 'Loja'})}
          >LOJA</button>
          <button 
            className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${form.tipo === 'Pessoal' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400'}`}
            onClick={() => setForm({...form, tipo: 'Pessoal'})}
          >PESSOAL</button>
        </div>

        {/* Data e Valor lado a lado */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Data</label>
            <input 
              type="date" 
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-slate-800 font-bold transition-all"
              value={form.data}
              onChange={(e) => setForm({...form, data: e.target.value})}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Valor R$</label>
            <input 
              type="number" 
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-slate-800 font-bold transition-all" 
              placeholder="0,00" 
              value={form.valor}
              onChange={(e) => setForm({...form, valor: e.target.value})} 
            />
          </div>
        </div>

        {/* Favorecido com Busca Automática */}
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Favorecido (Quem recebe?)</label>
          <input 
            list="lista-fornecedores"
            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-slate-800 font-bold transition-all"
            placeholder="Ex: Oxxo, Aluguel, CPFL..."
            value={form.favorecido}
            onChange={(e) => setForm({...form, favorecido: e.target.value})}
          />
          <datalist id="lista-fornecedores">
            {fornecedores.map((f, i) => <option key={i} value={f} />)}
          </datalist>
        </div>

        {/* Categoria vinda do Banco de Dados */}
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Categoria</label>
          <select 
            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-slate-800 font-bold transition-all appearance-none"
            value={form.categoria}
            onChange={(e) => setForm({...form, categoria: e.target.value})}
          >
            <option value="">Selecione...</option>
            {categoriasBD.map((cat, i) => (
              <option key={i} value={cat.nome}>{cat.nome}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleSubmit}
          className={`w-full py-5 rounded-2xl text-white font-black shadow-lg transition-all transform active:scale-95 uppercase tracking-widest text-xs ${form.tipo === 'Loja' ? 'bg-red-500 shadow-red-100 hover:bg-red-600' : 'bg-purple-600 shadow-purple-100 hover:bg-purple-700'}`}
        >
          Salvar Gasto
        </button>
      </div>
    </div>
  );
};

export default NovaDespesa;