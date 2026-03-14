import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../services/supabase';

const ImportadorVendas = ({ onSucesso }) => {
  const [loading, setLoading] = useState(false);

  const processarPlanilha = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      setLoading(true);
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      // 1. Agrupar linhas por DATA
      const agrupadoPorData = rows.reduce((acc, linha) => {
        const dataOriginal = linha.DATA;
        if (!dataOriginal) return acc;

        // Tratar data do Excel (número ou string)
        let dataFormatada;
        if (typeof dataOriginal === 'number') {
          dataFormatada = new Date((dataOriginal - 25569) * 86400 * 1000).toISOString().split('T')[0];
        } else {
          const partes = dataOriginal.split('/');
          dataFormatada = `${partes[2]}-${partes[1]}-${partes[0]}`;
        }

        if (!acc[dataFormatada]) {
          acc[dataFormatada] = {
            data_referencia: dataFormatada,
            dinheiro: 0, debito: 0, credito: 0, pix: 0, 
            pix_ecommerce: 0, voucher: 0, ifood: 0, keeta: 0, valor_bruto: 0
          };
        }

        // 2. Mapear o "TIPO DE VENDA" para a coluna correta
        const tipo = String(linha['TIPO DE VENDA']).toUpperCase().trim();
        const valor = parseFloat(String(linha.VALOR || '0').replace('R$', '').replace('.', '').replace(',', '.').trim()) || 0;

        if (tipo.includes('DINHEIRO') || tipo.includes('BOLOS')) acc[dataFormatada].dinheiro += valor;
        if (tipo.includes('DÉBITO')) acc[dataFormatada].debito += valor;
        if (tipo.includes('CRÉDITO')) acc[dataFormatada].credito += valor;
        if (tipo.includes('PIX E-COMERCE')) acc[dataFormatada].pix_ecommerce += valor;
        else if (tipo.includes('PIX')) acc[dataFormatada].pix += valor;
        if (tipo.includes('VR')) acc[dataFormatada].voucher += valor;
        if (tipo.includes('IFOOD')) acc[dataFormatada].ifood += valor;
        if (tipo.includes('KEETA')) acc[dataFormatada].keeta += valor;

        acc[dataFormatada].valor_bruto += valor;
        return acc;
      }, {});

      // 3. Converter objeto em array e enviar para o Supabase
      const listaParaInserir = Object.values(agrupadoPorData);

      const { error } = await supabase.from('faturamento_diario').insert(listaParaInserir);

      if (error) {
        alert("Erro ao importar: " + error.message);
      } else {
        alert("Importação de " + listaParaInserir.length + " dias concluída!");
        if (onSucesso) onSucesso();
      }
      setLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="bg-emerald-50 p-8 rounded-[2.5rem] border-2 border-dashed border-emerald-200 text-center">
      <h3 className="text-lg font-black text-emerald-800 uppercase tracking-tighter mb-2">Importar Histórico de Vendas</h3>
      <p className="text-sm text-emerald-600 mb-6 font-medium">Selecione o arquivo Excel para migrar os dados antigos</p>
      
      <label className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold cursor-pointer hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 inline-block">
        {loading ? 'Processando...' : 'Selecionar Arquivo'}
        <input type="file" accept=".xlsx, .xls" onChange={processarPlanilha} className="hidden" disabled={loading} />
      </label>
    </div>
  );
};

export default ImportadorVendas;