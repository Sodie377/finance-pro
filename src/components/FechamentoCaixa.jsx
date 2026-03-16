import React, { useState } from 'react';
import { supabase } from '../services/supabase';

const FechamentoCaixa = ({ onSucesso }) => {
  const [abaAtiva, setAbaAtiva] = useState('dinheiro');
  
  // 1. ESTADO DINHEIRO
  const [dinheiro, setDinheiro] = useState({
    moedas: { '0.05': '', '0.10': '', '0.25': '', '0.50': '', '1.00': '' },
    notas: { '2': '', '5': '', '10': '', '20': '', '50': '', '100': '', '200': '' },
    retirado: '' 
  });

  // 2. ESTADO CARTÕES E PIX
  const [cartoes, setCartoes] = useState({
    debito: { vr: '', visa: '', ticket: '', pluxee: '', pix: '', maestro: '', elo: '', amex: '', alelo: '' },
    credito: { visa: '', ticket: '', pluxee: '', elo: '', amex: '', alelo: '', master: '' },
    pix_ecommerce: '',
    voucher: '',
    bolos: ''
  });

  // 3. ESTADO APPS E PIX LOJA
  const [apps, setApps] = useState({
    ifood: { valor: '' },
    keeta: { valor: '' },
    pix_loja: ''
  });

  // --- CÁLCULOS ---
  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  const somarQtd = (obj) => Object.entries(obj).reduce((acc, [v, q]) => acc + (parseFloat(v) * (Number(q) || 0)), 0);
  const somarVal = (obj) => Object.values(obj).reduce((acc, v) => acc + (Number(v) || 0), 0);

  const totalDinheiroBruto = somarQtd(dinheiro.moedas) + somarQtd(dinheiro.notas);
  const totalDebito = somarVal(cartoes.debito);
  const totalCredito = somarVal(cartoes.credito);
  
  // TOTAL SISTEMA (Exatamente a ordem da sua planilha)
  const totalSistema = totalDebito + totalCredito + Number(cartoes.pix_ecommerce) + 
                       Number(cartoes.voucher) + Number(apps.pix_loja) + 
                       Number(apps.keeta.valor) + Number(apps.ifood.valor) + totalDinheiroBruto;

  const totalRealComBolos = totalSistema + Number(cartoes.bolos);
  const noCaixaSobrou = totalDinheiroBruto - (Number(dinheiro.retirado) || 0);

  // FUNÇÃO RELATÓRIO WHATSAPP
  const gerarRelatorioWhatsApp = () => {
    const data = new Date().toLocaleDateString('pt-BR');
    const msg = `*📋 FECHAMENTO DE CAIXA - ${data}*
---------------------------------------
*📊 CONFERÊNCIA SISTEMA*
🔹 Débito: ${formatarMoeda(totalDebito)}
🔹 Crédito: ${formatarMoeda(totalCredito)}
🔹 Pix E-commerce: ${formatarMoeda(Number(cartoes.pix_ecommerce))}
🔹 VR/Voucher: ${formatarMoeda(Number(cartoes.voucher))}
🔹 Pix Loja: ${formatarMoeda(Number(apps.pix_loja))}
🔹 Keeta: ${formatarMoeda(Number(apps.keeta.valor))}
🔹 iFood: ${formatarMoeda(Number(apps.ifood.valor))}
🔹 Dinheiro (Total): ${formatarMoeda(totalDinheiroBruto)}
*💰 TOTAL SISTEMA: ${formatarMoeda(totalSistema)}*

---------------------------------------
*🧁 NÃO DECLARADOS*
🔹 Bolos: ${formatarMoeda(Number(cartoes.bolos))}
*🚀 TOTAL REAL (SIST + BOLOS): ${formatarMoeda(totalRealComBolos)}*

---------------------------------------
*💸 MOVIMENTAÇÃO FÍSICA*
Retirada/Sangria: ${formatarMoeda(Number(dinheiro.retirado))}
*✅ SOBROU NO CAIXA: ${formatarMoeda(noCaixaSobrou)}*

---------------------------------------
👤 Resp: Flavio Daniel
_Enviado via Finance PRO_`;

    navigator.clipboard.writeText(msg);
    alert("Relatório copiado para o WhatsApp!");
  };

  const salvarNoBanco = async () => {
    const dados = {
      data_referencia: new Date().toISOString().split('T')[0],
      dinheiro: totalDinheiroBruto,
      debito: totalDebito,
      credito: totalCredito,
      pix: Number(apps.pix_lo_ja),
      pix_ecommerce: Number(cartoes.pix_ecommerce),
      voucher: Number(cartoes.voucher),
      ifood: Number(apps.ifood.valor),
      keeta: Number(apps.keeta.valor),
      bolos: Number(cartoes.bolos)
    };

    const { error } = await supabase.from('faturamento_diario').insert([dados]);
    if (error) alert("Erro: " + error.message);
    else {
      alert("Caixa salvo com sucesso!");
      if (onSucesso) onSucesso();
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden max-w-4xl mx-auto animate-in fade-in zoom-in duration-500">
      {/* MENU SUPERIOR */}
      <div className="flex bg-slate-900 p-2 gap-1">
        {['dinheiro', 'cartoes', 'apps', 'resumo'].map((tab) => (
          <button key={tab} onClick={() => setAbaAtiva(tab)} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${abaAtiva === tab ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
            {tab === 'dinheiro' ? '💵 Dinheiro' : tab === 'cartoes' ? '💳 Cartões' : tab === 'apps' ? '🛵 Apps' : '✅ Resumo'}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-10">
        {/* ABA DINHEIRO */}
        {abaAtiva === 'dinheiro' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
            <section className="space-y-2">
              <h4 className="text-[10px] font-black text-emerald-600 uppercase mb-4 tracking-widest border-b pb-2">🪙 Moedas</h4>
              {Object.keys(dinheiro.moedas).map(m => (
                <div key={m} className="flex justify-between bg-gray-50 p-3 rounded-xl">
                  <span className="text-xs font-bold text-gray-500">R$ {m}</span>
                  <input type="number" className="w-20 text-right font-bold bg-white border rounded p-1" value={dinheiro.moedas[m]} onChange={(e) => setDinheiro({...dinheiro, moedas: {...dinheiro.moedas, [m]: e.target.value}})} />
                </div>
              ))}
            </section>
            <section className="space-y-2">
              <h4 className="text-[10px] font-black text-emerald-600 uppercase mb-4 tracking-widest border-b pb-2">💵 Notas</h4>
              {Object.keys(dinheiro.notas).map(n => (
                <div key={n} className="flex justify-between bg-gray-50 p-3 rounded-xl">
                  <span className="text-xs font-bold text-gray-500">R$ {n},00</span>
                  <input type="number" className="w-20 text-right font-bold bg-white border rounded p-1" value={dinheiro.notas[n]} onChange={(e) => setDinheiro({...dinheiro, notas: {...dinheiro.notas, [n]: e.target.value}})} />
                </div>
              ))}
            </section>
          </div>
        )}

        {/* ABA CARTÕES */}
        {abaAtiva === 'cartoes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
            <section className="space-y-1">
              <h4 className="text-[10px] font-black text-blue-500 uppercase mb-4 border-b pb-2 tracking-widest">🟦 Débito</h4>
              {Object.keys(cartoes.debito).map(d => (
                <div key={d} className="flex justify-between bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{d}</span>
                  <input type="number" className="w-24 text-right font-bold outline-none bg-transparent" value={cartoes.debito[d]} onChange={(e) => setCartoes({...cartoes, debito: {...cartoes.debito, [d]: e.target.value}})} />
                </div>
              ))}
            </section>
            <section className="space-y-1">
              <h4 className="text-[10px] font-black text-orange-500 uppercase mb-4 border-b pb-2 tracking-widest">🟧 Crédito</h4>
              {Object.keys(cartoes.credito).map(c => (
                <div key={c} className="flex justify-between bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{c}</span>
                  <input type="number" className="w-24 text-right font-bold outline-none bg-transparent" value={cartoes.credito[c]} onChange={(e) => setCartoes({...cartoes, credito: {...cartoes.credito, [c]: e.target.value}})} />
                </div>
              ))}
            </section>
          </div>
        )}

        {/* ABA APPS */}
        {abaAtiva === 'apps' && (
          <div className="space-y-4 animate-in fade-in">
             <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                <h4 className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">🛵 Delivery e Outros</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                      <span className="text-xs font-bold text-gray-400 uppercase">Pix Loja</span>
                      <input type="number" className="w-28 text-right font-black text-emerald-600 outline-none" value={apps.pix_loja} onChange={(e) => setApps({...apps, pix_loja: e.target.value})} />
                   </div>
                   <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                      <span className="text-xs font-bold text-gray-400 uppercase">Pix E-com</span>
                      <input type="number" className="w-28 text-right font-black text-teal-600 outline-none" value={cartoes.pix_ecommerce} onChange={(e) => setCartoes({...cartoes, pix_ecommerce: e.target.value})} />
                   </div>
                   <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                      <span className="text-xs font-bold text-gray-400 uppercase">VR / Voucher</span>
                      <input type="number" className="w-28 text-right font-black text-pink-600 outline-none" value={cartoes.voucher} onChange={(e) => setCartoes({...cartoes, voucher: e.target.value})} />
                   </div>
                   <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                      <span className="text-xs font-bold text-gray-400 uppercase">iFood</span>
                      <input type="number" className="w-28 text-right font-black text-red-600 outline-none" value={apps.ifood.valor} onChange={(e) => setApps({...apps, ifood: {...apps.ifood, valor: e.target.value}})} />
                   </div>
                   <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                      <span className="text-xs font-bold text-gray-400 uppercase">Keeta</span>
                      <input type="number" className="w-28 text-right font-black text-orange-600 outline-none" value={apps.keeta.valor} onChange={(e) => setApps({...apps, keeta: {...apps.keeta, valor: e.target.value}})} />
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* ABA RESUMO (CONFORME SOLICITADO) */}
        {abaAtiva === 'resumo' && (
          <div className="space-y-6 animate-in zoom-in">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-6">Resumo Final do Sistema</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 border-b border-slate-700 pb-6 mb-6">
                <div><p className="text-[8px] uppercase text-slate-500 font-bold">Débito</p><p className="font-bold">{formatarMoeda(totalDebito)}</p></div>
                <div><p className="text-[8px] uppercase text-slate-500 font-bold">Crédito</p><p className="font-bold">{formatarMoeda(totalCredito)}</p></div>
                <div><p className="text-[8px] uppercase text-slate-500 font-bold">Pix E-com</p><p className="font-bold">{formatarMoeda(Number(cartoes.pix_ecommerce))}</p></div>
                <div><p className="text-[8px] uppercase text-slate-500 font-bold">VR</p><p className="font-bold">{formatarMoeda(Number(cartoes.voucher))}</p></div>
                <div><p className="text-[8px] uppercase text-slate-500 font-bold">Pix Loja</p><p className="font-bold">{formatarMoeda(Number(apps.pix_loja))}</p></div>
                <div><p className="text-[8px] uppercase text-slate-500 font-bold">Keeta</p><p className="font-bold">{formatarMoeda(Number(apps.keeta.valor))}</p></div>
                <div><p className="text-[8px] uppercase text-slate-500 font-bold">iFood</p><p className="font-bold">{formatarMoeda(Number(apps.ifood.valor))}</p></div>
                <div><p className="text-[8px] uppercase text-slate-500 font-bold">Dinheiro</p><p className="font-bold text-emerald-400">{formatarMoeda(totalDinheiroBruto)}</p></div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-xs font-black uppercase tracking-widest">Total Sistema:</span>
                <span className="text-3xl font-black text-emerald-400">{formatarMoeda(totalSistema)}</span>
              </div>

              <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-purple-400 uppercase">🧁 Bolos (Não Declarados):</span>
                  <input type="number" className="bg-transparent text-right font-black text-purple-400 outline-none w-24 text-xl" value={cartoes.bolos} onChange={(e) => setCartoes({...cartoes, bolos: e.target.value})} placeholder="0,00" />
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                  <span className="text-sm font-black text-white uppercase tracking-tighter">🚀 TOTAL REAL FINAL:</span>
                  <span className="text-3xl font-black text-white">{formatarMoeda(totalRealComBolos)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex justify-between items-center">
                  <span className="text-[10px] font-black text-orange-600 uppercase">Sangria/Retirada:</span>
                  <input type="number" className="bg-transparent text-right font-black text-orange-700 outline-none w-20" value={dinheiro.retirado} onChange={(e) => setDinheiro({...dinheiro, retirado: e.target.value})} />
               </div>
               <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex justify-between items-center">
                  <span className="text-[10px] font-black text-emerald-600 uppercase">No Caixa Sobrou:</span>
                  <span className="font-black text-emerald-700">{formatarMoeda(noCaixaSobrou)}</span>
               </div>
            </div>

            <div className="flex flex-col gap-3">
               <button onClick={salvarNoBanco} className="w-full bg-emerald-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95">💾 Salvar no Sistema</button>
               <button onClick={gerarRelatorioWhatsApp} className="w-full bg-[#25D366] text-white py-4 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">📱 Copiar para WhatsApp</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FechamentoCaixa;