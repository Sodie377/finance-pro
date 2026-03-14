import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const CadastroFornecedores = () => {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Loja');
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);

  const carregarFornecedores = async () => {
    const { data } = await supabase.from('fornecedores').select('*').order('nome');
    if (data) setLista(data);
  };

  const salvar = async () => {
    if (!nome.trim()) return alert("Digite o nome do fornecedor");
    
    setLoading(true);
    // Insere transformando em Título (Primeira letra maiúscula) para manter padrão
    const nomeFormatado = nome.trim();
    
    const { error } = await supabase.from('fornecedores').insert([{ nome: nomeFormatado, tipo }]);
    
    if (error) {
      if (error.code === '23505') alert("Este fornecedor já está cadastrado!");
      else alert("Erro ao salvar: " + error.message);
    } else {
      setNome('');
      carregarFornecedores();
    }
    setLoading(false);
  };

  const excluir = async (id) => {
    if (window.confirm("Tem certeza que deseja remover este fornecedor?")) {
      await supabase.from('fornecedores').delete().eq('id', id);
      carregarFornecedores();
    }
  };

  useEffect(() => { carregarFornecedores(); }, []);

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 animate-in fade-in duration-500">
      <h2 className="text-xl font-black mb-6 uppercase tracking-tighter text-slate-800">🤝 Gestão de Fornecedores</h2>
      
      <div className="flex gap-4 mb-8">
        <input 
          className="flex-1 p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 outline-none focus:border-emerald-500 focus:bg-white transition-all font-bold"
          placeholder="Ex: Oxxo, Aluguel, CPFL..."
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && salvar()} // Salva ao apertar Enter
        />
        <select 
          className="p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 font-bold outline-none cursor-pointer"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="Loja">🏪 Loja</option>
          <option value="Pessoal">🏠 Pessoal</option>
        </select>
        <button 
          onClick={salvar} 
          disabled={loading}
          className={`${loading ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-8 rounded-2xl font-black transition-all shadow-lg shadow-emerald-100`}
        >
          {loading ? '...' : 'CADASTRAR'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {lista.map(f => (
          <div key={f.id} className="p-4 border-2 border-gray-50 rounded-2xl flex justify-between items-center group hover:border-emerald-100 transition-all bg-white">
            <div className="overflow-hidden">
              <p className="font-black text-gray-700 uppercase text-xs truncate" title={f.nome}>{f.nome}</p>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${f.tipo === 'Loja' ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}`}>
                {f.tipo}
              </span>
            </div>
            {/* Botão de excluir que aparece no hover */}
            <button 
              onClick={() => excluir(f.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CadastroFornecedores;