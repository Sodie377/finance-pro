import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../services/supabase';

const ImportadorGastos = ({ onSucesso }) => {
  const [loading, setLoading] = useState(false);
  const [progresso, setProgresso] = useState('');

  const processarPlanilha = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      setLoading(true);
      setProgresso('Lendo despesas...');
      
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

      const listaParaInserir = rows.map(linha => {
        // 1. Tratar Data (VENCIMENTO) - Mantendo sua lógica excelente
        let dataFormatada;
        const d = linha.VENCIMENTO || linha.DATA; // Aceita as duas colunas
        if (typeof d === 'number') {
          dataFormatada = new Date((d - 25569) * 86400 * 1000).toISOString().split('T')[0];
        } else {
          const partes = String(d).trim().split('/');
          dataFormatada = partes.length === 3 
            ? `${partes[2]}-${partes[1]?.padStart(2, '0')}-${partes[0]?.padStart(2, '0')}`
            : new Date().toISOString().split('T')[0];
        }

        // 2. Favorecido
        let favorecido = String(linha.FORNECEDOR || linha.FAVORECIDO || 'NÃO IDENTIFICADO').trim().toUpperCase();
        
        // 3. Tipo (Loja ou Pessoal)
        const tipoOriginal = String(linha.TIPO || '').toUpperCase();
        const tipoFinal = (tipoOriginal.includes('CASA') || tipoOriginal.includes('PESSOAL')) ? 'Pessoal' : 'Loja';

        // 4. Tratar Valor (Sua lógica de limpeza de R$ e vírgulas)
        let valorRaw = String(linha.VALOR || '0').replace('R$', '').replace(/\s/g, '').trim();
        let valor = 0;
        if (valorRaw.includes(',') && valorRaw.includes('.')) {
          valor = parseFloat(valorRaw.replace(/\./g, '').replace(',', '.'));
        } else if (valorRaw.includes(',')) {
          valor = parseFloat(valorRaw.replace(',', '.'));
        } else {
          valor = parseFloat(valorRaw);
        }

        // 5. Categoria Inteligente
        // Se na planilha tiver a coluna CATEGORIA, usa ela. Senão, tenta adivinhar.
        let categoriaFinal = linha.CATEGORIA || 'Geral';
        if (!linha.CATEGORIA) {
            if (tipoOriginal.includes('INSUMOS')) categoriaFinal = 'Insumos';
            else if (tipoOriginal.includes('FIXO')) categoriaFinal = 'Fixo';
        }

        return {
          data: dataFormatada,
          favorecido: favorecido,
          valor: valor || 0,
          tipo: tipoFinal,
          categoria: categoriaFinal
        };
      }).filter(item => !isNaN(new Date(item.data).getTime()));

      try {
        const tamanhoLote = 100;
        for (let i = 0; i < listaParaInserir.length; i += tamanhoLote) {
          const lote = listaParaInserir.slice(i, i + tamanhoLote);
          const { error } = await supabase.from('despesas').insert(lote);
          if (error) throw error;
          setProgresso(`Importado: ${i + lote.length} despesas...`);
        }
        alert("✅ Histórico de Gastos importado com sucesso!");
        if (onSucesso) onSucesso();
      } catch (error) {
        alert("❌ Erro ao inserir no banco: " + error.message);
      } finally {
        setLoading(false);
        setProgresso('');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="bg-red-50 p-8 rounded-[2.5rem] border-2 border-dashed border-red-200 text-center my-6 shadow-inner">
      <div className="text-4xl mb-3">📤</div>
      <h3 className="text-lg font-black text-red-800 uppercase tracking-tighter mb-2">Importar Histórico de Gastos</h3>
      <p className="text-xs text-red-600 mb-6 font-bold uppercase tracking-widest opacity-70">Migrar planilha (Colunas: VENCIMENTO, TIPO, VALOR, FORNECEDOR)</p>
      
      <label className={`px-10 py-4 rounded-2xl font-black cursor-pointer transition-all shadow-xl inline-block uppercase text-xs tracking-widest ${loading ? 'bg-gray-400 text-white animate-pulse' : 'bg-red-500 text-white hover:bg-red-600 shadow-red-100'}`}>
        {loading ? progresso : 'Selecionar Arquivo Excel'}
        <input type="file" accept=".xlsx, .xls" onChange={processarPlanilha} className="hidden" />
      </label>
    </div>
  );
};

export default ImportadorGastos;