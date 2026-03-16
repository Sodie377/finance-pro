import React, { useState } from 'react';
import { supabase } from '../services/supabase';

const FechamentoCaixa = ({ onSucesso }) => {
  const [abaAtiva, setAbaAtiva] = useState('dinheiro');
  
  // 1. ESTADO DINHEIRO (Com Retirada/Sangria)
  const [dinheiro, setDinheiro] = useState({
    moedas: { '0.05': '', '0.10': '', '0.25': '', '0.50': '', '1.00': '' },
    notas: { '2': '', '5': '', '10': '', '20': '', '50': '', '100': '', '200': '' },
    retirado: '' // Valor que sai do caixa (Sangria)
  });

  // 2. ESTADO CARTÕES (Detalhado por Bandeira)
  const [cartoes, setCartoes] = useState({
    debito: { vr: '', visa: '', ticket: '', pluxee: '', pix: '', maestro: '', elo: '', amex: '', alelo: '' },
    credito: { visa: '', ticket: '', pluxee: '', elo: '', amex: '', alelo: '', master: '' },
    pix_ecommerce: '',
    voucher: '',
    bolos: ''
  });

  // 3. ESTADO APPS
  const [apps, setApps] = useState({
    ifood: { valor: '', taxa: '' },
    keeta: { valor: '', taxa: '' },
    pix_loja: ''
  });

  // --- CÁLCULOS AUXILIARES ---
  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  
  const somarObjetoQuantidades = (obj) => Object.entries(obj).reduce((acc, [v, q]) => acc + (parseFloat(v) * (Number(q) || 0)), 0);
  const somarValoresPuros = (obj) => Object.values(obj).reduce((acc, v) => acc + (Number(v) || 0), 0);

  // Totais calculados
  const totalDinheiroBruto = somarObjetoQuantidades(dinheiro.moedas) + somarObjetoQuantidades(dinheiro.notas);
  const totalNoCaixaFinal = totalDinheiroBruto - (Number(dinheiro.retirado) || 0);
  
  const totalDebito = somarValoresPuros(cartoes.debito);
  const totalCredito = somarValoresPuros(cartoes.credito);

  const totalGeralSistema = totalDinheiroBruto + totalDebito + totalCredito + 
                           Number(cartoes.pix_ecommerce) + Number(apps.pix_loja) + 
                           Number(cartoes.voucher) + Number(apps.ifood.valor) + 
                           Number(apps.keeta.valor) + Number(cartoes.bolos);

  const salvarNoBanco = async () => {
    const dados = {
      data_referencia: new Date().toISOString().split('T')[0],
      dinheiro: totalDinheiroBruto,
      debito: totalDebito,
      credito: totalCredito,
      pix: Number(apps.pix_loja),
      pix_ecommerce: Number(cartoes.pix_ecommerce),
      voucher: Number(cartoes.voucher),
      ifood: Number(apps.ifood.valor),
      keeta: Number(apps.keeta.valor),
      bolos: Number(cartoes.bolos)
    };

    const { error } = await supabase.from('faturamento_diario').insert([dados]);
    if (error) {
      alert("Erro ao salvar: " + error.message);
    } else {
      alert("Caixa fechado e contabilizado com sucesso!");
      if (onSucesso) onSucesso();
    }
  };

  const InputCampo = ({ label, value, onChange, placeholder = "0" }) => (
    <div className="flex items-center justify-between mb-2 bg-gray-50 p-3 rounded-xl border border-transparent focus-within:border-emerald-500 transition-all shadow-sm">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">{label}</span>
      <input 
        type="number" 
        className="w-24 bg-white border border-gray-100 text-right font-black text-emerald-700 outline-none rounded-lg p-1"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden max-w-4xl mx-auto animate-in fade-in zoom-in duration-500">
      
      {/* MENU DE NAVEGAÇÃO SUPERIOR */}
      <div className="flex bg-slate-900 p-2 gap-1">
        {[
          { id: 'dinheiro', icon: '💵', label: 'Dinheiro' },
          { id: 'cartoes', icon: '💳', label: 'Cartões' },
          { id: 'apps', icon: '🛵', label: 'Apps / Pix' },
          { id: 'resumo', icon: '✅', label: 'Resumo' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAbaAtiva(tab.id)}
            className={`flex-1 flex flex-col items-center py-3 rounded-2xl transition-all ${
              abaAtiva === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[9px] font-black uppercase mt-1">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="p-6 md:p-10 min-h-[500px]">
        
        {/* ABA DINHEIRO */}
        {abaAtiva === 'dinheiro' && (
          <div className="animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <section>
                <h4 className="text-[10px] font-black text-emerald-600 uppercase mb-4 tracking-widest border-b pb-2">🪙 Contagem de Moedas</h4>
                {Object.keys(dinheiro.moedas).map(m => (
                  <InputCampo key={m} label={`Moeda R$ ${m}`} value={dinheiro.moedas[m]} onChange={(v) => setDinheiro({...dinheiro, moedas: {...dinheiro.moedas, [m]: v}})} />
                ))}
              </section>
              <section>
                <h4 className="text-[10px] font-black text-emerald-600 uppercase mb-4 tracking-widest border-b pb-2">💵 Contagem de Notas</h4>
                {Object.keys(dinheiro.notas).map(n => (
                  <InputCampo key={n} label={`Nota R$ ${n},00`} value={dinheiro.notas[n]} onChange={(v) => setDinheiro({...dinheiro, notas: {...dinheiro.notas, [n]: v}})} />
                ))}
              </section>
            </div>

            <div className="mt-8 bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-200">
              <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-4">
                <p className="text-[10px] font-black uppercase opacity-60">Total Físico Contado</p>
                <p className="text-2xl font-black text-emerald-400">{formatarMoeda(totalDinheiroBruto)}</p>
              </div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-black uppercase opacity-60">Valor Retirado (Sangria)</p>
                <input 
                  type="number" 
                  className="bg-slate-800 border-2 border-slate-700 rounded-xl p-2 w-32 text-right font-black text-orange-400 outline-none focus:border-orange-500" 
                  value={dinheiro.retirado} 
                  onChange={(e) => setDinheiro({...dinheiro, retirado: e.target.value})}
                  placeholder="0,00"
                />
              </div>
              <div className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl border border-slate-700">
                <p className="text-xs font-black uppercase text-emerald-500 tracking-widest">Saldo Restante no Caixa:</p>
                <p className="text-2xl font-black">{formatarMoeda(totalNoCaixaFinal)}</p>
              </div>
            </div>
          </div>
        )}

        {/* ABA CARTÕES */}
        {abaAtiva === 'cartoes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in duration-500">
            <section>
              <h4 className="text-[10px] font-black text-blue-500 uppercase mb-4 tracking-widest border-b pb-2">🟦 Totais Débito</h4>
              {Object.keys(cartoes.debito).map(d => (
                <InputCampo key={d} label={`Débito ${d}`} value={cartoes.debito[d]} onChange={(v) => setCartoes({...cartoes, debito: {...cartoes.debito, [d]: v}})} />
              ))}
            </section>
            <section>
              <h4 className="text-[10px] font-black text-orange-500 uppercase mb-4 tracking-widest border-b pb-2">🟧 Totais Crédito</h4>
              {Object.keys(cartoes.credito).map(c => (
                <InputCampo key={c} label={`Crédito ${c}`} value={cartoes.credito[c]} onChange={(v) => setCartoes({...cartoes, credito: {...cartoes.credito, [c]: v}})} />
              ))}
            </section>
          </div>
        )}

        {/* ABA APPS / PIX */}
        {abaAtiva === 'apps' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100">
              <h4 className="text-[10px] font-black text-red-600 uppercase mb-4 tracking-widest">🛵 Aplicativos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputCampo label="Total iFood" value={apps.ifood.valor} onChange={(v) => setApps({...apps, ifood: {...apps.ifood, valor: v}})} />
                <InputCampo label="Total Keeta" value={apps.keeta.valor} onChange={(v) => setApps({...apps, keeta: {...apps.keeta, valor: v}})} />
              </div>
            </div>
            <div className="bg-cyan-50 p-6 rounded-[2rem] border border-cyan-100">
              <h4 className="text-[10px] font-black text-cyan-600 uppercase mb-4 tracking-widest">📱 Digitais / Outros</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputCampo label="Pix na Loja" value={apps.pix_loja} onChange={(v) => setApps({...apps, pix_loja: v})} />
                <InputCampo label="Pix E-commerce" value={cartoes.pix_ecommerce} onChange={(v) => setCartoes({...cartoes, pix_ecommerce: v})} />
                <InputCampo label="Voucher / VR" value={cartoes.voucher} onChange={(v) => setCartoes({...cartoes, voucher: v})} />
              </div>
            </div>
          </div>
        )}

        {/* ABA RESUMO (CONFORME FOTO 1) */}
        {abaAtiva === 'resumo' && (
          <div className="space-y-8 animate-in zoom-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Conferência de Faturamento</p>
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-bold">Total Sistema:</span> <span className="font-black text-slate-800">{formatarMoeda(totalGeralSistema)}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-bold">Total Dinheiro:</span> <span className="font-black text-emerald-600">{formatarMoeda(totalDinheiroBruto)}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-bold">Total Cartões:</span> <span className="font-black text-blue-600">{formatarMoeda(totalDebito + totalCredito)}</span></div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-3xl border-2 border-purple-100 shadow-sm">
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-4">🧁 Vendas Internas (Bolos)</p>
                <input 
                  type="number" 
                  className="w-full bg-white p-4 rounded-2xl border-2 border-purple-200 text-2xl font-black text-purple-800 outline-none focus:border-purple-500" 
                  value={cartoes.bolos} 
                  onChange={(e) => setCartoes({...cartoes, bolos: e.target.value})} 
                  placeholder="0,00" 
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
               <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Responsável pelo Fechamento</p>
                  <p className="text-lg font-black text-slate-700">Flavio Daniel</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Data de Referência</p>
                  <p className="text-lg font-black text-slate-700">{new Date().toLocaleDateString('pt-BR')}</p>
               </div>
            </div>

            <button 
              onClick={salvarNoBanco}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all transform active:scale-95"
            >
              ✅ Salvar e Finalizar Fechamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FechamentoCaixa;