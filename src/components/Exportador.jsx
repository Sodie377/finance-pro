import React from 'react';
import * as XLSX from 'xlsx'; // Importação corrigida para o Excel
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Importação corrigida para o PDF

const Exportador = ({ vendas, gastos, filtro }) => {
  
  // 📊 EXPORTAR EXCEL (XLSX)
  const exportarExcel = () => {
    if (!vendas || vendas.length === 0) return alert("Sem dados para exportar");

    const dataRef = vendas.map(v => ({
      Data: new Date(v.data_referencia).toLocaleDateString('pt-BR'),
      Bruto: v.valor_bruto || 0,
      Pix: v.pix || 0,
      Cartao: (v.debito || 0) + (v.credito || 0),
      iFood: v.ifood || 0,
      Dinheiro: v.dinheiro || 0
    }));
    
    // Usando XLSX.utils em vez de utils direto
    const ws = XLSX.utils.json_to_sheet(dataRef);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Faturamento");
    XLSX.writeFile(wb, `Relatorio_Financeiro_${filtro}.xlsx`);
  };

  // 📄 EXPORTAR PDF
  const exportarPDF = () => {
    if (!vendas || vendas.length === 0) return alert("Sem dados para exportar");

    const doc = new jsPDF();
    doc.text("Relatório de Faturamento - Finance Pro", 14, 20);
    
    const corpoTabela = vendas.map(v => [
      new Date(v.data_referencia).toLocaleDateString('pt-BR'),
      `R$ ${(v.valor_bruto || 0).toFixed(2)}`,
      `R$ ${(v.pix || 0).toFixed(2)}`,
      `R$ ${((v.debito || 0) + (v.credito || 0)).toFixed(2)}`,
      `R$ ${(v.ifood || 0).toFixed(2)}`
    ]);

    // Chamando a função autoTable corretamente
    autoTable(doc, {
      head: [['Data', 'Bruto Total', 'Pix', 'Cartões', 'iFood']],
      body: corpoTabela,
      startY: 30,
      headStyles: { fillColor: [16, 185, 129] }
    });

    doc.save(`Fechamento_${filtro}.pdf`);
  };

  // 🏦 EXPORTAR OFX
  const exportarOFX = () => {
    if (!vendas || vendas.length === 0) return alert("Sem dados para exportar");

    let ofx = `OFXHEADER:100\nDATA:OFXSGML\nVERSION:102\n<OFX>\n<BANKMSGSRSV1>\n<STMTTRNRS>\n<TRNUID>1\n<STMTRS>\n<CURDEF>BRL\n<BANKTRANLIST>\n`;
    
    vendas.forEach((v, index) => {
      const dataFormatada = v.data_referencia.replace(/-/g, '');
      ofx += `<STMTTRN>\n<TRNTYPE>CREDIT\n<DTPOSTED>${dataFormatada}\n<TRNAMT>${v.valor_bruto}\n<FITID>${index}\n<MEMO>Venda</MEMO>\n</STMTTRN>\n`;
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
        <h3 className="text-lg font-black text-slate-800">Relatório PDF</h3>
        <p className="text-sm text-slate-400 font-medium mt-1">Ideal para arquivar.</p>
      </button>

      <button onClick={exportarExcel} className="bg-white p-8 rounded-[2rem] shadow-sm border-2 border-transparent hover:border-emerald-500 transition-all text-left group">
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📊</div>
        <h3 className="text-lg font-black text-slate-800">Planilha Excel</h3>
        <p className="text-sm text-slate-400 font-medium mt-1">Para contabilidade.</p>
      </button>

      <button onClick={exportarOFX} className="bg-white p-8 rounded-[2rem] shadow-sm border-2 border-transparent hover:border-blue-500 transition-all text-left group">
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏦</div>
        <h3 className="text-lg font-black text-slate-800">Arquivo OFX</h3>
        <p className="text-sm text-slate-400 font-medium mt-1">Sistemas bancários.</p>
      </button>
    </div>
  );
};

export default Exportador;