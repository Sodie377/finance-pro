import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const ConfigCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState('');

  const carregarCategorias = async () => {
    const { data, error } = await supabase
      .from('categorias_gastos')
      .select('*')
      .order('nome', { ascending: true });
    if (data) setCategorias(data);
  };

  useEffect(() => { carregarCategorias(); }, []);

  const adicionarCategoria = async () => {
    if (!novaCategoria.trim()) return;
    const { error } = await supabase
      .from('categorias_gastos')
      .insert([{ nome: novaCategoria.trim() }]);
    
    if (error) alert("Erro ao adicionar: " + error.message);
    else {
      setNovaCategoria('');
      carregarCategorias();
    }
  };

  const deletarCategoria = async (id) => {
    if (window.confirm("Deseja excluir esta categoria?")) {
      await supabase.from('categorias_gastos').delete().eq('id', id);
      carregarCategorias();
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-500">
      <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800 mb-6">📂 Gerenciar Categorias de Gastos</h3>
      
      <div className="flex gap-4 mb-8">
        <input 
          type="text" 
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          placeholder="Ex: Insumos, Aluguel, Marketing..."
          className="flex-1 p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-red-500 font-medium"
        />
        <button 
          onClick={adicionarCategoria}
          className="bg-red-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100"
        >
          Adicionar
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {categorias.map((cat) => (
          <div key={cat.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-red-200 transition-all">
            <span className="font-bold text-slate-600 text-sm uppercase">{cat.nome}</span>
            <button 
              onClick={() => deletarCategoria(cat.id)}
              className="text-slate-300 hover:text-red-500 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfigCategorias;