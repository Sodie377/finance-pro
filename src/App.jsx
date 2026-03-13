import React, { useState, useEffect } from 'react'
import Sidebar from './components/sidebar'
import ModalVenda from './components/modals/ModalVenda'
import ModalGasto from './components/modals/ModalGasto'
import ExtratoVendas from './components/ExtratoVendas'
import ExtratoGastos from './components/ExtratoGastos' // Importado!
import FiltroData from './components/FiltroData'
import ConfigTaxas from './components/ConfigTaxas'
import { supabase } from './services/supabase'
import GraficoEvolucao from './components/GraficoEvolucao'
import Exportador from './components/Exportador'
import CadastroFornecedores from './components/CadastroFornecedores'
import GraficoDespesas from './components/GraficoDespesas'

function App() {
  const [activeTab, setActiveTab] = useState('dash')
  const [vendas, setVendas] = useState([])
  const [gastos, setGastos] = useState([])
  const [taxas, setTaxas] = useState([])
  
  const [filtro, setFiltro] = useState('mes')
  const [customDatas, setCustomDatas] = useState({ 
    inicio: new Date().toISOString().split('T')[0], 
    fim: new Date().toISOString().split('T')[0] 
  });

  const [isModalVendaOpen, setIsModalVendaOpen] = useState(false)
  const [isModalGastoOpen, setIsModalGastoOpen] = useState(false)

  const atualizarDados = async () => {
    let queryVendas = supabase.from('faturamento_diario').select('*').order('data_referencia', { ascending: false });
    let queryGastos = supabase.from('despesas').select('*').order('data', { ascending: false });
    const resTaxas = await supabase.from('taxas_cartao').select('*');

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (filtro === 'hoje') {
      const hojeStr = hoje.toISOString().split('T')[0];
      queryVendas = queryVendas.eq('data_referencia', hojeStr);
      queryGastos = queryGastos.eq('data', hojeStr);
    } else if (filtro === 'personalizado') {
      queryVendas = queryVendas.gte('data_referencia', customDatas.inicio).lte('data_referencia', customDatas.fim);
      queryGastos = queryGastos.gte('data', customDatas.inicio).lte('data', customDatas.fim);
    } else if (filtro === '7dias') {
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(hoje.getDate() - 7);
      const dataStr = seteDiasAtras.toISOString().split('T')[0];
      queryVendas = queryVendas.gte('data_referencia', dataStr);
      queryGastos = queryGastos.gte('data', dataStr);
    } else if (filtro === 'mes') {
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
      queryVendas = queryVendas.gte('data_referencia', primeiroDiaMes);
      queryGastos = queryGastos.gte('data', primeiroDiaMes);
    }

    const [resVendas, resGastos] = await Promise.all([queryVendas, queryGastos]);
    
    if (resVendas.data) setVendas(resVendas.data);
    if (resGastos.data) setGastos(resGastos.data);
    if (resTaxas.data) setTaxas(resTaxas.data);
  }

  useEffect(() => { atualizarDados(); }, [filtro, customDatas]);

  const calcularTotalLiquido = () => {
    return vendas.reduce((accTotal, dia) => {
      let liquidoDia = 0;
      const colunas = [
        { campo: 'dinheiro', nome: 'Dinheiro' },
        { campo: 'debito', nome: 'Debito' },
        { campo: 'credito', nome: 'Credito' },
        { campo: 'pix', nome: 'Pix' },
        { campo: 'pix_ecommerce', nome: 'Pix E-commerce' },
        { campo: 'voucher', nome: 'Voucher' },
        { campo: 'ifood', nome: 'iFood' },
        { campo: 'keeta', nome: 'Keeta' },
      ];

      colunas.forEach(col => {
        const valorBruto = dia[col.campo] || 0;
        const conf = taxas.find(t => t.nome_metodo.toLowerCase() === col.nome.toLowerCase());
        if (conf) {
          liquidoDia += valorBruto - (valorBruto * (conf.taxa_percentual / 100)) - (valorBruto > 0 ? conf.taxa_fixa : 0);
        } else {
          liquidoDia += valorBruto;
        }
      });
      return accTotal + liquidoDia;
    }, 0);
  };

  const totalBruto = vendas.reduce((acc, v) => acc + (v.valor_bruto || 0), 0)
  const totalLiquido = calcularTotalLiquido();
  const totalLoja = gastos.filter(g => g.tipo === 'Loja').reduce((acc, g) => acc + (g.valor || 0), 0)
  const totalPessoal = gastos.filter(g => g.tipo === 'Pessoal').reduce((acc, g) => acc + (g.valor || 0), 0)
  const lucroReal = totalLiquido - totalLoja - totalPessoal

  return (
    <div className="flex bg-gray-50 min-h-screen w-full font-sans text-gray-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 ml-64 p-10">
        
        {activeTab === 'taxas' && <ConfigTaxas />}
        {activeTab === 'fornecedores' && <CadastroFornecedores />}

        {activeTab === 'relatorios' && (
          <div className="space-y-6">
            <div className="mb-10">
              <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-800">Central de Exportação</h1>
              <p className="text-slate-400 font-medium">Gere arquivos PDF, Excel ou OFX do período selecionado.</p>
            </div>
            <FiltroData filtro={filtro} setFiltro={setFiltro} customDatas={customDatas} setCustomDatas={setCustomDatas} />
            <Exportador vendas={vendas} gastos={gastos} filtro={filtro} />
          </div>
        )}

        {/* CONTEÚDO PRINCIPAL (DASHBOARD, VENDAS, GASTOS) */}
        {activeTab !== 'taxas' && activeTab !== 'relatorios' && activeTab !== 'fornecedores' && (
          <>
            {/* CABEÇALHO LIMPO - SEM O TÍTULO REPETIDO */}
            <div className="flex justify-between items-center mb-10">
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Visão Geral</p>
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter">
                  {activeTab === 'dash' ? 'DASHBOARD' : activeTab === 'vendas' ? 'VENDAS' : 'EXTRATO DE GASTOS'}
                </h2>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsModalVendaOpen(true)} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all hover:-translate-y-1">+ Nova Venda</button>
                <button onClick={() => setIsModalGastoOpen(true)} className="bg-red-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-600 transition-all hover:-translate-y-1">- Novo Gasto</button>
              </div>
            </div>

            <FiltroData filtro={filtro} setFiltro={setFiltro} customDatas={customDatas} setCustomDatas={setCustomDatas} />

            {activeTab === 'dash' && (
              <>
                {/* OS 5 CARDS DE KPI */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
                  <div className="bg-white p-5 rounded-3xl shadow-sm border-b-8 border-emerald-500 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bruto Total</p>
                    <p className="text-xl font-black text-emerald-600 font-mono">R$ {totalBruto.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl shadow-sm border-b-8 border-cyan-500 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Líquido</p>
                    <p className="text-xl font-black text-cyan-600 font-mono">R$ {totalLiquido.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl shadow-sm border-b-8 border-red-500 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gastos Loja</p>
                    <p className="text-xl font-black text-red-600 font-mono">R$ {totalLoja.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl shadow-sm border-b-8 border-purple-500 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gastos Casa</p>
                    <p className="text-xl font-black text-purple-600 font-mono">R$ {totalPessoal.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl shadow-sm border-b-8 border-blue-600 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Saldo Real</p>
                    <p className={`text-xl font-black font-mono ${lucroReal >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                      R$ {lucroReal.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* GRÁFICOS */}
                <div className="mt-8">
                  <GraficoEvolucao vendas={vendas} taxas={taxas} />
                </div>
                <GraficoDespesas gastos={gastos} />
              </>
            )}

            {activeTab === 'vendas' && <ExtratoVendas lista={vendas} />}
            
            {(activeTab === 'gastos_biz' || activeTab === 'gastos_pers') && (
              <div className="space-y-4">
                {gastos.filter(g => g.tipo === (activeTab === 'gastos_pers' ? 'Pessoal' : 'Loja')).length > 0 ? (
                  <ExtratoGastos lista={gastos.filter(g => g.tipo === (activeTab === 'gastos_pers' ? 'Pessoal' : 'Loja'))} />
                ) : (
                  <div className="text-center p-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium italic">Nenhum gasto encontrado neste período.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* MODAIS (Mantenha igual ao seu) */}
        <ModalVenda 
          isOpen={isModalVendaOpen} 
          onClose={() => setIsModalVendaOpen(false)} 
          onSalvar={async (d) => {
            const { error } = await supabase.from('faturamento_diario').insert([d]);
            if (error) alert("Erro: " + error.message);
            else { atualizarDados(); setIsModalVendaOpen(false); }
          }} 
        />
        <ModalGasto 
          isOpen={isModalGastoOpen} 
          onClose={() => setIsModalGastoOpen(false)} 
          tipoPadrao={activeTab === 'gastos_pers' ? 'Pessoal' : 'Loja'}
          onSalvar={async (d) => {
            const { error } = await supabase.from('despesas').insert([d]);
            if (error) alert("Erro: " + error.message);
            else { atualizarDados(); setIsModalGastoOpen(false); }
          }} 
        />
      </main>
    </div>
  )
}

export default App