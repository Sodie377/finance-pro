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
        // 1. Tratar Data (VENCIMENTO)
        let dataFormatada;
        const d = linha.VENCIMENTO;
        if (typeof d === 'number') {
          dataFormatada = new Date((d - 25569) * 86400 * 1000).toISOString().split('T')[0];
        } else {
          const partes = String(d).trim().split('/');
          dataFormatada = `${partes[2]}-${partes[1]?.padStart(2, '0')}-${partes[0]?.padStart(2, '0')}`;
        }

        // 2. Limpar e Traduzir Fornecedor
        let favorecido = String(linha.FORNECEDOR || 'NÃO IDENTIFICADO').trim().toUpperCase();
        if (favorecido === '' || favorecido === 'undefined') favorecido = 'DIVERSOS / OUTROS';
        
        // 3. Definir Tipo (Loja ou Pessoal)
        const tipoOriginal = String(linha.TIPO || '').toUpperCase();
        const tipoFinal = tipoOriginal.includes('CASA') ? 'Pessoal' : 'Loja';

        // 4. Tratar Valor
        let valorRaw = String(linha.VALOR || '0').replace('R$', '').replace(/\s/g, '').trim();
        let valor = 0;
        if (valorRaw.includes(',') && valorRaw.includes('.')) {
          valor = parseFloat(valorRaw.replace(/\./g, '').replace(',', '.'));
        } else if (valorRaw.includes(',')) {
          valor = parseFloat(valorRaw.replace(',', '.'));
        } else {
          valor = parseFloat(valorRaw);
        }

        return {
          data: dataFormatada,
          descricao: favorecido,
          favorecido: favorecido,
          valor: valor || 0,
          tipo: tipoFinal,
          categoria: tipoOriginal.includes('INSUMOS') ? 'Insumos' : 'Operacional'
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
        alert("❌ Erro: " + error.message);
      } finally {
        setLoading(false);
        setProgresso('');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="bg-red-50 p-8 rounded-[2.5rem] border-2 border-dashed border-red-200 text-center my-6">
      <h3 className="text-lg font-black text-red-800 uppercase tracking-tighter mb-2">Importar Histórico de Gastos</h3>
      <p className="text-sm text-red-600 mb-6 font-medium">Migrar planilha de despesas (Vencimento, Tipo, Valor)</p>
      <label className={`px-8 py-3 rounded-2xl font-bold cursor-pointer transition-all shadow-lg inline-block ${loading ? 'bg-gray-400 text-white' : 'bg-red-500 text-white hover:bg-red-600 shadow-red-100'}`}>
        {loading ? progresso : 'Selecionar Planilha de Gastos'}
        <input type="file" accept=".xlsx, .xls" onChange={processarPlanilha} className="hidden" />
      </label>
    </div>
  );
};

export default ImportadorGastos;