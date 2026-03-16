import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

const ModalGasto = ({ isOpen, onClose, onSalvar, tipoPadrao }) => {
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState(tipoPadrao || 'Loja');
  const [favorecido, setFavorecido] = useState('');
  const [categoria, setCategoria] = useState('');
  const [dataGasto, setDataGasto] = useState(new Date().toISOString().split('T')[0]);
  const [fornecedores, setFornecedores] = useState([]);
  const [categoriasBD, setCategoriasBD] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setTipo(tipoPadrao);
      setDataGasto(new Date().toISOString().split('T')[0]);
      buscarFornecedores();
      buscarCategorias();
    }
  }, [isOpen, tipoPadrao]);

  const buscarFornecedores = async () => {
    const { data } = await supabase.from('fornecedores').select('nome').order('nome');
    if (data) setFornecedores(data.map(f => f.nome));
  };

  const buscarCategorias = async () => {
    const { data } = await supabase.from('categorias_gastos').select('nome').order('nome');
    if (data) setCategoriasBD(data);
  };

  const handleSalvar = async () => {
    if (!valor || !favorecido) return alert("Preencha o valor e o favorecido!");

    const existe = fornecedores.some(f => f.toLowerCase() === favorecido.toLowerCase());
    if (!existe) {
      await supabase.from('fornecedores').insert([{ nome: favorecido, tipo: tipo }]);
    }

    onSalvar({
      valor: parseFloat(valor),
      tipo,
      favorecido,
      categoria: categoria || 'Outros',
      data: dataGasto
    });
    
    limparCampos();
    onClose();
  };

  const limparCampos = () => {
    setValor('');
    setFavorecido('');
    setCategoria('');
    setDataGasto(new Date().toISOString().split('T')[0]);
  };

  if (!isOpen) return null;

  return (
    <div className="space-y-5">
      {/* 1. SELETOR DE TIPO (Fica no topo do formulário) */}
      <div className="flex bg-gray-100 p-1 rounded-2xl">
        <button 
          onClick={() => setTipo('Loja')} 
          className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${tipo === 'Loja' ? 'bg-white shadow-sm text-red-600' : 'text-gray-400'}`}
        >
          LOJA
        </button>
        <button 
          onClick={() => setTipo('Pessoal')} 
          className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${tipo === 'Pessoal' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400'}`}
        >
          PESSOAL
        </button>
      </div>

      {/* 2. CAMPO DE DATA (Agora visível e centralizado) */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Data do Pagamento</label>
        <input 
          type="date"
          className="w-full bg-transparent outline-none font-bold text-slate-700"
          value={dataGasto}
          onChange={(e) => setDataGasto(e.target.value)}
        />
      </div>

      {/* 3. FAVORECIDO */}
      <div>
        <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Favorecido (Quem recebe?)</label>
        <input 
          list="lista-fornecedores"
          className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-slate-800 font-bold"
          placeholder="Ex: Oxxo, Caixa, Aluguel..."
          value={favorecido}
          onChange={(e) => setFavorecido(e.target.value)}
        />
        <datalist id="lista-fornecedores">
          {fornecedores.map((f, i) => <option key={i} value={f} />)}
        </datalist>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Valor (R$)</label>
          <input 
            type="number"
            step="0.01"
            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-slate-800 font-mono font-bold"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Categoria</label>
          <select 
            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-slate-800 font-bold"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="">Outros</option>
            {categoriasBD.map((cat, i) => (
              <option key={i} value={cat.nome}>{cat.nome}</option>
            ))}
          </select>
        </div>
      </div>

      <button 
        onClick={handleSalvar}
        className={`w-full py-5 rounded-2xl text-white font-black shadow-lg transition-all transform active:scale-95 uppercase tracking-widest text-xs ${tipo === 'Loja' ? 'bg-red-500 shadow-red-100 hover:bg-red-600' : 'bg-purple-600 shadow-purple-100 hover:bg-purple-700'}`}
      >
        Confirmar Lançamento
      </button>
    </div>
  );
};

export default ModalGasto;