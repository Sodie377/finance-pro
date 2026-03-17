import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const ListaCompras = () => {
  const [itens, setItens] = useState([]);
  const [novoItem, setNovoItem] = useState('');

  // Carregar lista do banco
  const carregarLista = async () => {
    const { data, error } = await supabase
      .from('lista_compras')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) setItens(data);
  };

  useEffect(() => { carregarLista(); }, []);

  const adicionarItem = async (e) => {
    if (e.key === 'Enter' && novoItem.trim()) {
      const { error } = await supabase
        .from('lista_compras')
        .insert([{ nome: novoItem.trim(), comprado: false }]);
      
      if (!error) {
        setNovoItem('');
        carregarLista();
      }
    }
  };

  const alternarComprado = async (id, status) => {
    await supabase.from('lista_compras').update({ comprado: !status }).eq('id', id);
    carregarLista();
  };

  const excluirItem = async (id) => {
    await supabase.from('lista_compras').delete().eq('id', id);
    carregarLista();
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in zoom-in duration-500">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-slate-900 p-8 text-center">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">🛒 Lista de Compras</h2>
          <p className="text-slate-400 text-xs font-bold uppercase mt-2 opacity-60">Adicione itens e aperte Enter</p>
        </div>

        <div className="p-6">
          <input
            type="text"
            className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-slate-700 transition-all mb-6 shadow-inner"
            placeholder="O que precisa comprar?"
            value={novoItem}
            onChange={(e) => setNovoItem(e.target.value)}
            onKeyDown={adicionarItem}
          />

          <div className="space-y-3">
            {itens.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl hover:shadow-md transition-all group">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => alternarComprado(item.id, item.comprado)}>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.comprado ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                    {item.comprado && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className={`font-bold transition-all ${item.comprado ? 'line-through text-gray-300' : 'text-slate-700'}`}>
                    {item.nome}
                  </span>
                </div>
                
                <button 
                  onClick={() => excluirItem(item.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
                >
                  ✕
                </button>
              </div>
            ))}
            
            {itens.length === 0 && (
              <p className="text-center text-gray-400 font-bold py-10 uppercase text-[10px] tracking-widest">Sua lista está vazia</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListaCompras;