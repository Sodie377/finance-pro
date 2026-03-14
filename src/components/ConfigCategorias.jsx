import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const ConfigCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [nova, setNova] = useState('');

  const carregar = async () => {
    const { data } = await supabase.from('categorias_gastos').select('*').order('nome');
    if (data) setCategorias(data);
  };

  useEffect(() => { carregar(); }, []);

  const salvar = async () => {
    if (!nova) return;
    await supabase.from('categorias_gastos').insert([{ nome: nova }]);
    setNova('');
    carregar();
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
      <h3 className="text-lg font-black uppercase mb-4 tracking-tighter text-slate-800">📂 Categorias de Gastos</h3>
      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          className="flex-1 p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Nova categoria (ex: Internet)"
          value={nova} onChange={e => setNova(e.target.value)}
        />
        <button onClick={salvar} className="bg-red-500 text-white px-6 rounded-xl font-bold">Adicionar</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categorias.map(cat => (
          <span key={cat.id} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-xs font-bold uppercase">
            {cat.nome}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ConfigCategorias;