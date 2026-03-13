import React, { useState, useRef } from 'react';

const NovaVenda = ({ onSalvar }) => {
  const [dados, setDados] = useState({
    dinheiro: 0, debito: 0, credito: 0, 
    pix: 0, pix_ecommerce: 0, voucher: 0,
    ifood: 0, keeta: 0
  });

  const inputsRef = useRef([]);

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = inputsRef.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      } else {
        // Se for o último, foca no botão de salvar em vez de salvar direto (evita erro)
        document.getElementById('btn-salvar').focus();
      }
    }
  };

  const total = Object.values(dados).reduce((acc, val) => acc + val, 0);

  const campos = [
    { id: 'dinheiro', label: '💵 Dinheiro', color: 'focus:ring-green-500' },
    { id: 'debito', label: '💳 Débito', color: 'focus:ring-blue-500' },
    { id: 'credito', label: '💳 Crédito', color: 'focus:ring-orange-500' },
    { id: 'pix', label: '📱 Pix', color: 'focus:ring-emerald-500' },
    { id: 'pix_ecommerce', label: '🌐 Pix E-commerce', color: 'focus:ring-teal-500' },
    { id: 'voucher', label: '🎟️ Voucher', color: 'focus:ring-yellow-500' },
    { id: 'ifood', label: '🛵 iFood', color: 'focus:ring-red-500' },
    { id: 'keeta', label: '🥡 Keeta', color: 'focus:ring-pink-500' },
  ];

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full border-t-8 border-emerald-600">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">📊 Faturamento Bruto</h2>
        <p className="text-gray-400 text-sm font-medium">Preencha e use <kbd className="bg-gray-200 px-1 rounded text-gray-600">Enter</kbd> para navegar</p>
      </div>
      
      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
        {campos.map((item, index) => (
          <div key={item.id} className="flex flex-col">
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1 tracking-widest">
              {item.label}
            </label>
            <input 
              ref={el => inputsRef.current[index] = el}
              type="number" 
              step="0.01"
              className={`w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none transition-all text-lg font-semibold ${item.color} focus:bg-white focus:border-current shadow-sm`}
              placeholder="0,00"
              onKeyDown={(e) => handleKeyDown(e, index)}
              onChange={(e) => setDados({...dados, [item.id]: Number(e.target.value)})}
            />
          </div>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Total Acumulado</p>
          <p className="text-5xl font-black text-emerald-600 tracking-tighter">
            <span className="text-2xl mr-1 font-bold">R$</span>
            {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <button 
          id="btn-salvar"
          onClick={() => onSalvar(dados)}
          className="bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 text-white font-black py-5 px-12 rounded-3xl shadow-xl transition-all transform active:scale-95 uppercase tracking-widest text-sm"
        >
          Salvar Dados
        </button>
      </div>
    </div>
  );
};

export default NovaVenda;