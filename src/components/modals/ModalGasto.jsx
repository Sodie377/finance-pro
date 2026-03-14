import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

const ModalGasto = ({ isOpen, onClose, onSalvar, tipoPadrao }) => {
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState(tipoPadrao || 'Loja');
  const [favorecido, setFavorecido] = useState('');
  const [categoria, setCategoria] = useState('');
  const [fornecedores, setFornecedores] = useState([]);
  const [categoriasBD, setCategoriasBD] = useState([]); // Novo estado para categorias

  useEffect(() => {
    if (isOpen) {
      setTipo(tipoPadrao);
      buscarFornecedores();
      buscarCategorias(); // Busca categorias do banco ao abrir
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

    // LÓGICA AUTOMÁTICA: Se o favorecido não existe, cadastra
    const existe = fornecedores.some(f => f.toLowerCase() === favorecido.toLowerCase());
    if (!existe) {
      await supabase.from('fornecedores').insert([{ nome: favorecido, tipo: tipo }]);
    }

    const dados = {
      valor: parseFloat(valor),
      tipo,
      favorecido,
      categoria: categoria || 'Outros', // Fallback caso não selecione
      data: new Date().toISOString().split('T')[0]
    };

    onSalvar(dados);
    limparCampos();
    onClose(); // Fecha o modal após salvar
  };

  const limparCampos = () => {
    setValor('');
    setFavorecido('');
    setCategoria('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className={`p-6 text-white flex justify-between items-center ${tipo === 'Loja' ? 'bg-red-500' : 'bg-purple-600'}`}>
          <h2 className="font-black uppercase tracking-tighter">Novo Gasto - {tipo}</h2>
          <button onClick={onClose} className="hover:rotate-90 transition-all font-bold">✕</button>
        </div>

        <div className="p-8 space-y-5">
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button onClick={() => setTipo('Loja')} className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${tipo === 'Loja' ? 'bg-white shadow-sm text-red-600' : 'text-gray-400'}`}>LOJA</button>
            <button onClick={() => setTipo('Pessoal')} className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${tipo === 'Pessoal' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400'}`}>PESSOAL</button>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Favorecido (Quem recebe?)</label>
            <input 
              list="lista-fornecedores"
              className="w-full p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 outline-none focus:border-slate-800 font-bold"
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
                className="w-full p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 outline-none focus:border-slate-800 font-mono font-bold"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Categoria</label>
              <select 
                className="w-full p-4 rounded-2xl border-2 border-gray-50 bg-gray-50 outline-none focus:border-slate-800 font-bold"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="">Outros</option>
                {/* MAP DIRETO DO BANCO DE DADOS */}
                {categoriasBD.map((cat, i) => (
                  <option key={i} value={cat.nome}>{cat.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            onClick={handleSalvar}
            className={`w-full py-5 rounded-2xl text-white font-black shadow-lg transition-all ${tipo === 'Loja' ? 'bg-red-500 shadow-red-100 hover:bg-red-600' : 'bg-purple-600 shadow-purple-100 hover:bg-purple-700'}`}
          >
            SALVAR GASTO
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalGasto;