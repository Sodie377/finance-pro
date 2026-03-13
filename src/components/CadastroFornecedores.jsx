import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const CadastroFornecedores = () => {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Loja');
  const [lista, setLista] = useState([]);

  const carregarFornecedores = async () => {
    const { data } = await supabase.from('fornecedores').select('*').order('nome');
    if (data) setLista(data);
  };

  const salvar = async () => {
    if (!nome) return;
    await supabase.from('fornecedores').insert([{ nome, tipo }]);
    setNome('');
    carregarFornecedores();
  };

  useEffect(() => { carregarFornecedores(); }, []);

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
      <h2 className="text-xl font-black mb-6 uppercase tracking-tighter">Gestão de Fornecedores / Favorecidos</h2>
      
      <div className="flex gap-4 mb-8">
        <input 
          className="flex-1 p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 outline-none focus:border-emerald-500 transition-all font-bold"
          placeholder="Nome (ex: Oxxo, Aluguel, Financiamento Casa)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <select 
          className="p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 font-bold outline-none"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="Loja">Loja</option>
          <option value="Pessoal">Pessoal</option>
        </select>
        <button onClick={salvar} className="bg-emerald-600 text-white px-8 rounded-2xl font-black hover:bg-emerald-700 transition-all">
          CADASTRAR
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {lista.map(f => (
          <div key={f.id} className="p-4 border-2 border-gray-50 rounded-2xl flex justify-between items-center group hover:border-emerald-100 transition-all">
            <div>
              <p className="font-black text-gray-700 uppercase text-xs">{f.nome}</p>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${f.tipo === 'Loja' ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}`}>
                {f.tipo}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CadastroFornecedores;