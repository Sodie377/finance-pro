import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../services/supabase';

const ImportadorVendas = ({ onSucesso }) => {
  const [loading, setLoading] = useState(false);
  const [progresso, setProgresso] = useState('');

  const processarPlanilha = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      setLoading(true);
      setProgresso('Lendo arquivo...');
      
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      setProgresso('Agrupando 2.500+ linhas...');

      const agrupadoPorData = rows.reduce((acc, linha) => {
        const dataOriginal = linha.DATA;
        if (!dataOriginal) return acc;

        let dataFormatada;
        if (typeof dataOriginal === 'number') {
          dataFormatada = new Date((dataOriginal - 25569) * 86400 * 1000).toISOString().split('T')[0];
        } else {
          const partes = String(dataOriginal).split('/');
          dataFormatada = `${partes[2]}-${partes[1]}-${partes[0]}`;
        }

        if (!acc[dataFormatada]) {
          acc[dataFormatada] = {
            data_referencia: dataFormatada,
            dinheiro: 0, debito: 0, credito: 0, pix: 0, 
            pix_ecommerce: 0, voucher: 0, ifood: 0, keeta: 0
          };
        }

        const tipo = String(linha['TIPO DE VENDA'] || '').toUpperCase().trim();
        
        // --- LÓGICA DE VALOR CORRIGIDA ---
        let valorRaw = String(linha.VALOR || '0').replace('R$', '').replace(/\s/g, '').trim();
        
        let valor;
        // Se o valor tem vírgula e ponto (ex: 1.250,50), removemos o ponto e trocamos a vírgula
        if (valorRaw.includes(',') && valorRaw.includes('.')) {
          valor = parseFloat(valorRaw.replace(/\./g, '').replace(',', '.'));
        } 
        // Se só tem vírgula (ex: 783,60), trocamos por ponto
        else if (valorRaw.includes(',')) {
          valor = parseFloat(valorRaw.replace(',', '.'));
        } 
        // Se já for formato limpo (ex: 783.60)
        else {
          valor = parseFloat(valorRaw);
        }
        
        if (isNaN(valor)) valor = 0;
        // --------------------------------

        if (tipo.includes('DINHEIRO') || tipo.includes('BOLOS')) acc[dataFormatada].dinheiro += valor;
        else if (tipo.includes('DÉBITO')) acc[dataFormatada].debito += valor;
        else if (tipo.includes('CRÉDITO')) acc[dataFormatada].credito += valor;
        else if (tipo.includes('PIX E-COMERCE')) acc[dataFormatada].pix_ecommerce += valor;
        else if (tipo.includes('PIX')) acc[dataFormatada].pix += valor;
        else if (tipo.includes('VR')) acc[dataFormatada].voucher += valor;
        else if (tipo.includes('IFOOD')) acc[dataFormatada].ifood += valor;
        else if (tipo.includes('KEETA')) acc[dataFormatada].keeta += valor;

        return acc;
      }, {});

      const listaParaInserir = Object.values(agrupadoPorData);
      setProgresso(`Enviando ${listaParaInserir.length} dias para o banco...`);

      try {
        const tamanhoLote = 50;
        for (let i = 0; i < listaParaInserir.length; i += tamanhoLote) {
          const lote = listaParaInserir.slice(i, i + tamanhoLote);
          const { error } = await supabase.from('faturamento_diario').insert(lote);
          if (error) throw error;
          setProgresso(`Enviado: ${Math.min(i + tamanhoLote, listaParaInserir.length)} de ${listaParaInserir.length} dias`);
        }

        alert("🚀 Importação concluída com sucesso!");
        if (onSucesso) onSucesso();
      } catch (error) {
        console.error(error);
        alert("❌ Erro ao importar: " + error.message);
      } finally {
        setLoading(false);
        setProgresso('');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="bg-emerald-50 p-8 rounded-[2.5rem] border-2 border-dashed border-emerald-200 text-center my-6">
      <h3 className="text-lg font-black text-emerald-800 uppercase tracking-tighter mb-2">Importar Histórico de Vendas</h3>
      <p className="text-sm text-emerald-600 mb-6 font-medium">Use sua planilha limpa (Sem as linhas 1 e 2 do Excel)</p>
      
      <label className={`px-8 py-3 rounded-2xl font-bold cursor-pointer transition-all shadow-lg inline-block ${loading ? 'bg-gray-400 text-white' : 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700'}`}>
        {loading ? progresso : 'Selecionar Arquivo Excel'}
        <input type="file" accept=".xlsx, .xls" onChange={processarPlanilha} className="hidden" disabled={loading} />
      </label>
    </div>
  );
};

export default ImportadorVendas;