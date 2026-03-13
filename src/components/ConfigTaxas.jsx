import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const ConfigTaxas = () => {
  const [taxas, setTaxas] = useState([]);
  const [novaTaxa, setNovaTaxa] = useState({ nome_metodo: '', taxa_percentual: '', taxa_fixa: '' });

  const carregarTaxas = async () => {
    const { data } = await supabase.from('taxas_cartao').select('*');
    if (data) setTaxas(data);
  };

  useEffect(() => { carregarTaxas(); }, []);

  const salvarTaxa = async () => {
    if (!novaTaxa.nome_metodo) return alert("Digite o nome do método");
    const { error } = await supabase.from('taxas_cartao').insert([novaTaxa]);
    if (!error) {
      setNovaTaxa({ nome_metodo: '', taxa_percentual: '', taxa_fixa: '' });
      carregarTaxas();
    }
  };

  const excluirTaxa = async (id) => {
    await supabase.from('taxas_cartao').delete().eq('id', id);
    carregarTaxas();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-black mb-4 uppercase tracking-tighter">⚙️ Configurar Taxas</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input type="text" placeholder="Método (Ex: iFood)" className="p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
            value={novaTaxa.nome_metodo} onChange={e => setNovaTaxa({...novaTaxa, nome_metodo: e.target.value})} />
          <input type="number" placeholder="Taxa %" className="p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
            value={novaTaxa.taxa_percentual} onChange={e => setNovaTaxa({...novaTaxa, taxa_percentual: e.target.value})} />
          <input type="number" placeholder="Taxa Fixa R$" className="p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
            value={novaTaxa.taxa_fixa} onChange={e => setNovaTaxa({...novaTaxa, taxa_fixa: e.target.value})} />
          <button onClick={salvarTaxa} className="bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all">Adicionar</button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
            <tr>
              <th className="p-4">Método</th>
              <th className="p-4">Percentual (%)</th>
              <th className="p-4">Fixo (R$)</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {taxas.map(t => (
              <tr key={t.id} className="text-sm font-medium text-gray-700">
                <td className="p-4">{t.nome_metodo}</td>
                <td className="p-4">{t.taxa_percentual}%</td>
                <td className="p-4">R$ {t.taxa_fixa.toFixed(2)}</td>
                <td className="p-4 text-center">
                  <button onClick={() => excluirTaxa(t.id)} className="text-red-400 hover:text-red-600">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConfigTaxas;