import React from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Exportador = ({ vendas, gastos, filtro }) => {
  
  // Função auxiliar para evitar que a data mude por causa do fuso horário
  const formatarData = (dataStr) => {
    return new Date(dataStr + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  // 📊 EXPORTAR EXCEL (XLSX)
  const exportarExcel = () => {
    if (!vendas || vendas.length === 0) return alert("Sem dados para exportar");

    const dataRef = vendas.map(v => ({
      Data: formatarData(v.data_referencia),
      'Bruto Oficial': v.valor_bruto || 0,
      'Bolos (Interno)': v.bolos || 0, // Adicionado Bolos
      'Total Real': (v.valor_bruto || 0) + (v.bolos || 0), // Soma total
      Pix: v.pix || 0,
      Cartao: (v.debito || 0) + (v.credito || 0),
      iFood: v.ifood || 0,
      Keeta: v.keeta || 0, // Adicionado Keeta que faltava no seu
      Dinheiro: v.dinheiro || 0
    }));
    
    const ws = XLSX.utils.json_to_sheet(dataRef);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Faturamento");
    XLSX.writeFile(wb, `Relatorio_Financeiro_${filtro}.xlsx`);
  };

  // 📄 EXPORTAR PDF
  const exportarPDF = () => {
    if (!vendas || vendas.length === 0) return alert("Sem dados para exportar");

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relatório de Faturamento - Finance Pro", 14, 20);
    doc.setFontSize(10);
    doc.text(`Período: ${filtro.toUpperCase()}`, 14, 28);
    
    const corpoTabela = vendas.map(v => [
      formatarData(v.data_referencia),
      `R$ ${(v.valor_bruto || 0).toFixed(2)}`,
      `R$ ${(v.bolos || 0).toFixed(2)}`, // Adicionado Bolos no PDF
      `R$ ${((v.valor_bruto || 0) + (v.bolos || 0)).toFixed(2)}`, // Total Real
      `R$ ${(v.pix || 0).toFixed(2)}`,
      `R$ ${((v.debito || 0) + (v.credito || 0)).toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [['Data', 'Oficial', 'Bolos', 'Total Real', 'Pix', 'Cartões']],
      body: corpoTabela,
      startY: 35,
      headStyles: { fillColor: [16, 185, 129] }, // Verde Esmeralda
      alternateRowStyles: { fillColor: [245, 247, 250] }
    });

    doc.save(`Fechamento_${filtro}.pdf`);
  };

  // 🏦 EXPORTAR OFX
  const exportarOFX = () => {
    if (!vendas || vendas.length === 0) return alert("Sem dados para exportar");

    let ofx = `OFXHEADER:100\nDATA:OFXSGML\nVERSION:102\n<OFX>\n<BANKMSGSRSV1>\n<STMTTRNRS>\n<TRNUID>1\n<STMTRS>\n<CURDEF>BRL\n<BANKTRANLIST>\n`;
    
    vendas.forEach((v, index) => {
      const dataFormatada = v.data_referencia.replace(/-/g, '');
      // No OFX exportamos o valor Bruto Real (Oficial + Bolos) para bater com o caixa físico
      const valorTotal = (v.valor_bruto || 0) + (v.bolos || 0);
      ofx += `<STMTTRN>\n<TRNTYPE>CREDIT\n<DTPOSTED>${dataFormatada}\n<TRNAMT>${valorTotal.toFixed(2)}\n<FITID>${index}\n<MEMO>Faturamento Total</MEMO>\n</STMTTRN>\n`;
    });

    ofx += `</BANKTRANLIST>\n</STMTRS>\n</STMTTRNRS>\n</BANKMSGSRSV1>\n</OFX>`;
    
    const blob = new Blob([ofx], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Extrato_${filtro}.ofx`;
    a.click();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
      <button onClick={exportarPDF} className="bg-white p-8 rounded-[2rem] shadow-sm border-2 border-transparent hover:border-red-500 transition-all text-left group">
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📄</div>
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Relatório PDF</h3>
        <p className="text-xs text-slate-400 font-bold uppercase mt-1">Ideal para arquivar e conferir.</p>
      </button>

      <button onClick={exportarExcel} className="bg-white p-8 rounded-[2rem] shadow-sm border-2 border-transparent hover:border-emerald-500 transition-all text-left group">
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📊</div>
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Planilha Excel</h3>
        <p className="text-xs text-slate-400 font-bold uppercase mt-1">Análise de dados completa.</p>
      </button>

      <button onClick={exportarOFX} className="bg-white p-8 rounded-[2rem] shadow-sm border-2 border-transparent hover:border-blue-500 transition-all text-left group">
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏦</div>
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Arquivo OFX</h3>
        <p className="text-xs text-slate-400 font-bold uppercase mt-1">Conciliação Bancária.</p>
      </button>
    </div>
  );
};

export default Exportador;