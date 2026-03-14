import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const ConfigTaxas = () => {
  const [taxas, setTaxas] = useState([]);
  const [novaTaxa, setNovaTaxa] = useState({ 
    nome_metodo: '', 
    taxa_percentual: '', 
    taxa_fixa: '',
    vinculo: '' // Novo campo para o vínculo
  });

  const carregarTaxas = async () => {
    const { data } = await supabase.from('taxas_cartao').select('*');
    if (data) setTaxas(data);
  };

  useEffect(() => { carregarTaxas(); }, []);

  const salvarTaxa = async () => {
    if (!novaTaxa.nome_metodo || !novaTaxa.vinculo) {
      return alert("Preencha o nome e selecione a qual área vincular!");
    }
    
    const { error } = await supabase.from('taxas_cartao').insert([novaTaxa]);
    if (!error) {
      setNovaTaxa({ nome_metodo: '', taxa_percentual: '', taxa_fixa: '', vinculo: '' });
      carregarTaxas();
    } else {
      alert("Erro ao salvar: " + error.message);
    }
  };

  const excluirTaxa = async (id) => {
    await supabase.from('taxas_cartao').delete().eq('id', id);
    carregarTaxas();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h2 className="text-xl font-black mb-6 uppercase tracking-tighter text-slate-800">⚙️ Configurar Taxas e Vínculos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* NOME LIVRE */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Nome Personalizado</label>
            <input type="text" placeholder="Ex: Débito Visa" 
              className="p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium" 
              value={novaTaxa.nome_metodo} onChange={e => setNovaTaxa({...novaTaxa, nome_metodo: e.target.value})} />
          </div>

          {/* VÍNCULO (O Segredo da sua lógica) */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-emerald-600 uppercase ml-2">Vincular à Área:</label>
            <select 
              className="p-3 bg-emerald-50 text-emerald-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              value={novaTaxa.vinculo} onChange={e => setNovaTaxa({...novaTaxa, vinculo: e.target.value})}
            >
              <option value="">Selecione...</option>
              <option value="debito">💳 Área Débito</option>
              <option value="credito">💳 Área Crédito</option>
              <option value="pix">📱 Área Pix</option>
              <option value="ifood">🛵 Área iFood</option>
              <option value="keeta">🥡 Área Keeta</option>
              <option value="voucher">🎟️ Área Voucher</option>
              <option value="pix_ecommerce">🌐 Pix E-commerce</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Taxa %</label>
            <input type="number" placeholder="0.00" className="p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
              value={novaTaxa.taxa_percentual} onChange={e => setNovaTaxa({...novaTaxa, taxa_percentual: e.target.value})} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Fixo R$</label>
            <input type="number" placeholder="0.00" className="p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
              value={novaTaxa.taxa_fixa} onChange={e => setNovaTaxa({...novaTaxa, taxa_fixa: e.target.value})} />
          </div>

          <button onClick={salvarTaxa} className="bg-emerald-600 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 self-end h-[50px]">
            Vincular
          </button>
        </div>
      </div>

      {/* TABELA DE TAXAS */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
            <tr>
              <th className="p-5">Método Personalizado</th>
              <th className="p-5">Vínculo do Sistema</th>
              <th className="p-5">Percentual</th>
              <th className="p-5">Fixo</th>
              <th className="p-5 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {taxas.map(t => (
              <tr key={t.id} className="text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                <td className="p-5">{t.nome_metodo}</td>
                <td className="p-5">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] uppercase">
                    {t.vinculo}
                  </span>
                </td>
                <td className="p-5 text-emerald-600">{t.taxa_percentual}%</td>
                <td className="p-5 text-slate-400">R$ {Number(t.taxa_fixa || 0).toFixed(2)}</td>
                <td className="p-5 text-center">
                  <button onClick={() => excluirTaxa(t.id)} className="text-red-400 hover:text-red-600 font-black text-xs uppercase tracking-widest">Excluir</button>
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