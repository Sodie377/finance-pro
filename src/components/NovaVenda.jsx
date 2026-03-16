import React, { useState, useRef } from 'react';

const NovaVenda = ({ onSalvar }) => {
  const [dados, setDados] = useState({
    data_referencia: new Date().toISOString().split('T')[0], 
    dinheiro: '', debito: '', credito: '', 
    pix: '', pix_ecommerce: '', voucher: '',
    ifood: '', keeta: '', bolos: ''
  });

  const inputsRef = useRef([]);

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = inputsRef.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      } else {
        document.getElementById('btn-salvar').focus();
      }
    }
  };

  const totalGeral = Object.entries(dados).reduce((acc, [key, val]) => {
    return key === 'data_referencia' ? acc : acc + (Number(val) || 0);
  }, 0);

  // NOVA ORDEM BASEADA NA SUA PLANILHA
  const campos = [
    { id: 'debito', label: '💳 Débito', color: 'focus:ring-blue-500' },
    { id: 'credito', label: '💳 Crédito', color: 'focus:ring-orange-500' },
    { id: 'pix_ecommerce', label: '🌐 Pix E-commerce', color: 'focus:ring-teal-500' },
    { id: 'voucher', label: '🎟️ Vale-Refeição (VR)', color: 'focus:ring-yellow-500' },
    { id: 'pix', label: '📱 Pix (Loja)', color: 'focus:ring-emerald-500' },
    { id: 'keeta', label: '🥡 Keeta', color: 'focus:ring-pink-500' },
    { id: 'ifood', label: '🛵 iFood', color: 'focus:ring-red-500' },
    { id: 'dinheiro', label: '💵 Dinheiro', color: 'focus:ring-green-500' },
    { id: 'bolos', label: '🧁 Bolos (Interno)', color: 'focus:ring-purple-600' },
  ];

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-2xl w-full border-t-8 border-emerald-600 animate-in zoom-in duration-300">
      
      <div className="mb-8 flex justify-between items-center bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
        <div>
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">📊 Fechamento de Caixa</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Preencha na ordem da planilha</p>
        </div>
        
        <div className="flex flex-col items-end">
          <label className="text-[10px] font-black text-emerald-600 uppercase mb-1 mr-2">Data do Faturamento</label>
          <input 
            type="date"
            className="p-3 bg-white border-2 border-emerald-100 rounded-2xl text-sm font-black text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            value={dados.data_referencia}
            onChange={(e) => setDados({...dados, data_referencia: e.target.value})}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {campos.map((item, index) => (
          <div key={item.id} className={`flex flex-col ${item.id === 'bolos' ? 'col-span-2 bg-purple-50 p-3 rounded-[1.5rem] border border-purple-100 mt-2' : ''}`}>
            <label className={`text-[9px] font-black uppercase mb-1 ml-2 tracking-widest ${item.id === 'bolos' ? 'text-purple-600' : 'text-gray-400'}`}>
              {item.label}
            </label>
            <input 
              ref={el => inputsRef.current[index] = el}
              type="number" 
              step="0.01"
              className={`w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none transition-all text-lg font-bold ${item.color} focus:bg-white focus:border-current shadow-sm`}
              placeholder="0,00"
              value={dados[item.id]}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onChange={(e) => setDados({...dados, [item.id]: e.target.value})}
            />
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Geral (Com Bolos)</p>
          <p className="text-4xl font-black text-emerald-600 font-mono">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalGeral)}
          </p>
        </div>
        
        <button 
          id="btn-salvar"
          onClick={() => {
            const valoresNum = { ...dados };
            let brutoOficial = 0;

            Object.keys(valoresNum).forEach(key => {
              if (key !== 'data_referencia') {
                const n = Number(valoresNum[key]) || 0;
                valoresNum[key] = n;
                if (key !== 'bolos') brutoOficial += n;
              }
            });

            // Envia para o App.jsx, onde o campo valor_bruto será removido antes do insert final
            onSalvar({
              ...valoresNum,
              valor_bruto: brutoOficial
            });
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 px-10 rounded-3xl shadow-xl shadow-emerald-100 transition-all transform active:scale-95 uppercase tracking-widest text-xs"
        >
          Salvar Fechamento
        </button>
      </div>
    </div>
  );
};

export default NovaVenda;