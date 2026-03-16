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
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

      setProgresso('Agrupando dados...');

      const agrupadoPorData = rows.reduce((acc, linha) => {
        const dataOriginal = linha.DATA;
        if (!dataOriginal) return acc;

        let dataFormatada;
        try {
          if (typeof dataOriginal === 'number') {
            const baseDate = new Date((dataOriginal - 25569) * 86400 * 1000);
            dataFormatada = baseDate.toISOString().split('T')[0];
          } else {
            const partes = String(dataOriginal).trim().split('/');
            if (partes.length !== 3) return acc;
            dataFormatada = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
          }
        } catch (e) { return acc; }

        if (!acc[dataFormatada]) {
          acc[dataFormatada] = {
            data_referencia: dataFormatada,
            dinheiro: 0, debito: 0, credito: 0, pix: 0, 
            pix_ecommerce: 0, voucher: 0, ifood: 0, keeta: 0,
            bolos: 0,
            valor_bruto: 0 // Inicia o bruto oficial
          };
        }

        const tipo = String(linha['TIPO DE VENDA'] || '').toUpperCase().trim();
        let valorRaw = String(linha.VALOR || '').replace('R$', '').replace(/\s/g, '').trim();
        if (valorRaw === '' || valorRaw === '-') return acc;

        let valor = parseFloat(valorRaw.replace(/\./g, '').replace(',', '.')) || 0;
        
        // MAPEAMENTO E CÁLCULO DO BRUTO OFICIAL
        if (tipo.includes('BOLOS')) {
          acc[dataFormatada].bolos += valor;
        } else {
          // Se não é bolo, soma no valor_bruto (faturamento oficial da loja)
          acc[dataFormatada].valor_bruto += valor;

          if (tipo.includes('DINHEIRO')) acc[dataFormatada].dinheiro += valor;
          else if (tipo.includes('DÉBITO')) acc[dataFormatada].debito += valor;
          else if (tipo.includes('CRÉDITO')) acc[dataFormatada].credito += valor;
          else if (tipo.includes('PIX E-COMERCE')) acc[dataFormatada].pix_ecommerce += valor;
          else if (tipo.includes('PIX')) acc[dataFormatada].pix += valor;
          else if (tipo.includes('VR')) acc[dataFormatada].voucher += valor;
          else if (tipo.includes('IFOOD')) acc[dataFormatada].ifood += valor;
          else if (tipo.includes('KEETA')) acc[dataFormatada].keeta += valor;
        }

        return acc;
      }, {});

      const listaParaInserir = Object.values(agrupadoPorData);
      
      try {
        const tamanhoLote = 50;
        for (let i = 0; i < listaParaInserir.length; i += tamanhoLote) {
          const lote = listaParaInserir.slice(i, i + tamanhoLote);
          const { error } = await supabase.from('faturamento_diario').insert(lote);
          if (error) throw error;
          setProgresso(`Importado: ${Math.min(i + lote.length, listaParaInserir.length)} dias`);
        }
        alert("✅ Histórico de Vendas importado com sucesso!");
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
    <div className="bg-emerald-50 p-10 rounded-[3rem] border-4 border-dashed border-emerald-100 text-center my-8">
      <div className="text-5xl mb-4">📈</div>
      <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tighter">Importar Planilha de Vendas</h3>
      <p className="text-sm text-emerald-600 mb-8 font-bold uppercase tracking-widest opacity-60">Reconhece colunas: DATA, TIPO DE VENDA e VALOR</p>
      
      <label className={`px-12 py-5 rounded-[2rem] font-black cursor-pointer transition-all shadow-2xl inline-block uppercase text-xs tracking-widest ${loading ? 'bg-gray-400 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 active:scale-95 shadow-emerald-200'}`}>
        {loading ? progresso : 'Selecionar Arquivo XLSX'}
        <input type="file" accept=".xlsx, .xls" onChange={processarPlanilha} className="hidden" disabled={loading} />
      </label>
    </div>
  );
};

export default ImportadorVendas;