import React, { useState } from 'react';
import { supabase } from '../services/supabase';

const FechamentoCaixa = ({ onSucesso }) => {
  const [abaAtiva, setAbaAtiva] = useState('dinheiro');
  
  // 1. ESTADO DINHEIRO (Foto 2)
  const [dinheiro, setDinheiro] = useState({
    moedas: { '0.05': '', '0.10': '', '0.25': '', '0.50': '', '1.00': '' },
    notas: { '2': '', '5': '', '10': '', '20': '', '50': '', '100': '', '200': '' },
    retirado: ''
  });

  // 2. ESTADO CARTÕES (Foto 5)
  const [cartoes, setCartoes] = useState({
    debito: { vr: '', visa: '', ticket: '', pluxee: '', pix: '', maestro: '', elo: '', amex: '', alelo: '' },
    credito: { visa: '', ticket: '', pluxee: '', elo: '', amex: '', alelo: '', master: '' },
    pix_ecommerce: '',
    voucher: '',
    bolos: ''
  });

  // 3. ESTADO APPS (Foto 3)
  const [apps, setApps] = useState({
    ifood: { valor: '', taxa: '' },
    keeta: { valor: '', taxa: '' },
    pix_loja: ''
  });

  // --- CÁLCULOS ---
  const somarObjeto = (obj) => Object.entries(obj).reduce((acc, [v, q]) => acc + (parseFloat(v) * (Number(q) || 0)), 0);
  const somarValores = (obj) => Object.values(obj).reduce((acc, v) => acc + (Number(v) || 0), 0);

  const totalMoedas = somarObjeto(dinheiro.moedas);
  const totalNotas = somarObjeto(dinheiro.notas);
  const totalDinheiroCorrente = totalMoedas + totalNotas;
  const totalDebito = somarValores(cartoes.debito);
  const totalCredito = somarValores(cartoes.credito);

  const totalGeralSistema = totalDinheiroCorrente + totalDebito + totalCredito + 
                           Number(cartoes.pix_ecommerce) + Number(apps.pix_loja) + 
                           Number(cartoes.voucher) + Number(apps.ifood.valor) + 
                           Number(apps.keeta.valor) + Number(cartoes.bolos);

  const salvarNoBanco = async () => {
    const dados = {
      data_referencia: new Date().toISOString().split('T')[0],
      dinheiro: totalDinheiroCorrente,
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
    if (error) alert("Erro ao salvar: " + error.message);
    else {
      alert("Caixa fechado com sucesso!");
      if (onSucesso) onSucesso();
    }
  };

  const InputCampo = ({ label, value, onChange, placeholder = "0" }) => (
    <div className="flex items-center justify-between mb-2 bg-gray-50 p-3 rounded-xl border border-transparent focus-within:border-emerald-500 transition-all">
      <span className="text-[11px] font-bold text-gray-500 uppercase">{label}</span>
      <input 
        type="number" 
        className="w-24 bg-white border-none text-right font-black text-emerald-700 outline-none rounded-lg p-1"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden max-w-4xl mx-auto animate-in fade-in zoom-in duration-500">
      {/* MENU DE NAVEGAÇÃO */}
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
        {/* ABA DINHEIRO (Notas e Moedas) */}
        {abaAtiva === 'dinheiro' && (
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
              <div className="mt-6 bg-slate-900 p-6 rounded-[2rem] text-white">
                <p className="text-[10px] font-black uppercase opacity-50">Total Físico</p>
                <p className="text-3xl font-black">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDinheiroCorrente)}</p>
              </div>
            </section>
          </div>
        )}

        {/* ABA CARTÕES (Débito e Crédito Detalhado) */}
        {abaAtiva === 'cartoes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
          <div className="space-y-6">
            <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100">
              <h4 className="text-[10px] font-black text-red-600 uppercase mb-4">🛵 Delivery (iFood / Keeta)</h4>
              <div className="grid grid-cols-2 gap-4">
                <InputCampo label="iFood Valor" value={apps.ifood.valor} onChange={(v) => setApps({...apps, ifood: {...apps.ifood, valor: v}})} />
                <InputCampo label="Keeta Valor" value={apps.keeta.valor} onChange={(v) => setApps({...apps, keeta: {...apps.keeta, valor: v}})} />
              </div>
            </div>
            <div className="bg-cyan-50 p-6 rounded-[2rem] border border-cyan-100">
              <h4 className="text-[10px] font-black text-cyan-600 uppercase mb-4">📱 Pagamentos Digitais</h4>
              <div className="grid grid-cols-2 gap-4">
                <InputCampo label="Pix Loja" value={apps.pix_loja} onChange={(v) => setApps({...apps, pix_loja: v})} />
                <InputCampo label="Pix E-commerce" value={cartoes.pix_ecommerce} onChange={(v) => setCartoes({...cartoes, pix_ecommerce: v})} />
                <InputCampo label="Voucher / VR" value={cartoes.voucher} onChange={(v) => setCartoes({...cartoes, voucher: v})} />
              </div>
            </div>
          </div>
        )}

        {/* ABA RESUMO FINAL (A foto 1) */}
        {abaAtiva === 'resumo' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-600 uppercase">Total Geral</p>
                <p className="text-2xl font-black text-emerald-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalGeralSistema)}</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100">
                <p className="text-[10px] font-black text-purple-600 uppercase">Bolos (Interno)</p>
                <input type="number" className="w-full bg-transparent text-2xl font-black text-purple-800 outline-none" 
                       value={cartoes.bolos} onChange={(e) => setCartoes({...cartoes, bolos: e.target.value})} placeholder="0,00" />
              </div>
              <div className="bg-slate-100 p-6 rounded-3xl">
                <p className="text-[10px] font-black text-slate-500 uppercase">Responsável</p>
                <p className="text-sm font-bold text-slate-700">Flavio Daniel</p>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-center">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Conferência Finalizada?</p>
              <button 
                onClick={salvarNoBanco}
                className="bg-emerald-500 hover:bg-emerald-400 text-white w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-900/20"
              >
                Confirmar Fechamento no Sistema
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FechamentoCaixa;