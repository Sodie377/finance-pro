import React, { useState, useEffect } from 'react'
import Sidebar from './components/sidebar'
import ModalVenda from './components/modals/ModalVenda'
import ModalGasto from './components/modals/ModalGasto'
import ExtratoVendas from './components/ExtratoVendas'
import ExtratoGastos from './components/ExtratoGastos'
import FiltroData from './components/FiltroData'
import ConfigTaxas from './components/ConfigTaxas'
import { supabase } from './services/supabase'
import GraficoEvolucao from './components/GraficoEvolucao'
import Exportador from './components/Exportador'
import CadastroFornecedores from './components/CadastroFornecedores'
import GraficoDespesas from './components/GraficoDespesas'
import ImportadorVendas from './components/ImportadorVendas'
import ImportadorGastos from './components/ImportadorGastos'
import ConfigCategorias from './components/ConfigCategorias'
import Configuracoes from './components/Configuracoes'
import FechamentoCaixa from './components/FechamentoCaixa' 

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

    const hojeStr = new Date().toLocaleDateString('en-CA'); 

    if (filtro === 'hoje') {
      queryVendas = queryVendas.eq('data_referencia', hojeStr);
      queryGastos = queryGastos.eq('data', hojeStr);
    } else if (filtro === 'personalizado') {
      queryVendas = queryVendas.gte('data_referencia', customDatas.inicio).lte('data_referencia', customDatas.fim);
      queryGastos = queryGastos.gte('data', customDatas.inicio).lte('data', customDatas.fim);
    } else if (filtro === '7dias') {
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
      const dataStr = seteDiasAtras.toLocaleDateString('en-CA');
      queryVendas = queryVendas.gte('data_referencia', dataStr);
      queryGastos = queryGastos.gte('data', dataStr);
    } else if (filtro === 'mes') {
      const agora = new Date();
      const primeiroDiaMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toLocaleDateString('en-CA');
      queryVendas = queryVendas.gte('data_referencia', primeiroDiaMes);
      queryGastos = queryGastos.gte('data', primeiroDiaMes);
    }

    const [resVendas, resGastos] = await Promise.all([queryVendas, queryGastos]);
    
    if (resVendas.data) setVendas(resVendas.data);
    if (resGastos.data) setGastos(resGastos.data);
    if (resTaxas.data) setTaxas(resTaxas.data);
  }

  const excluirRegistro = async (id, tabela) => {
    if (!confirm("Tem certeza que deseja excluir este registro permanentemente?")) return;
    const { error } = await supabase.from(tabela).delete().eq('id', id);
    if (error) {
      alert("Erro ao excluir: " + error.message);
    } else {
      atualizarDados(); 
    }
  };

  useEffect(() => { atualizarDados(); }, [filtro, customDatas]);

  const calcularTotalLiquido = () => {
    return vendas.reduce((accTotal, dia) => {
      let liquidoDia = 0;
      const camposVenda = ['dinheiro', 'debito', 'credito', 'pix', 'pix_ecommerce', 'voucher', 'ifood', 'keeta', 'bolos'];

      camposVenda.forEach(campo => {
        const valorBruto = dia[campo] || 0;
        const conf = taxas.find(t => t.vinculo === campo);

        if (conf && valorBruto > 0 && campo !== 'bolos' && campo !== 'dinheiro') {
          const desconto = (valorBruto * (conf.taxa_percentual / 100)) + (conf.taxa_fixa || 0);
          liquidoDia += (valorBruto - desconto);
        } else {
          liquidoDia += valorBruto;
        }
      });
      return accTotal + liquidoDia;
    }, 0);
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  };

  const totalBruto = vendas.reduce((acc, v) => acc + (v.valor_bruto || 0), 0)
  const totalLiquido = calcularTotalLiquido();
  const totalLoja = gastos.filter(g => g.tipo === 'Loja').reduce((acc, g) => acc + (g.valor || 0), 0)
  const totalPessoal = gastos.filter(g => g.tipo === 'Pessoal').reduce((acc, g) => acc + (g.valor || 0), 0)
  const lucroReal = totalLiquido - totalLoja
  const saldoFinal = totalLiquido - totalLoja - totalPessoal

  return (
    <div className="flex bg-gray-50 min-h-screen w-full font-sans text-gray-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-10 transition-all w-full overflow-x-hidden">
        
        {activeTab === 'fechamento' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-800">Fechamento de Caixa</h1>
              <p className="text-slate-400 font-medium">Conferência detalhada e conciliação de PDV.</p>
            </div>
            <FechamentoCaixa onSucesso={() => {
              atualizarDados();
              setActiveTab('dash'); 
            }} />
          </div>
        )}

        {activeTab === 'taxas' && <Configuracoes />}
        {activeTab === 'fornecedores' && <CadastroFornecedores />}

        {activeTab === 'relatorios' && (
          <div className="space-y-6">
            <div className="mb-10">
              <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-800 text-center md:text-left">Central de Exportação</h1>
              <ImportadorVendas onSucesso={atualizarDados} />
              <ImportadorGastos onSucesso={atualizarDados} />
            </div>
            <FiltroData filtro={filtro} setFiltro={setFiltro} customDatas={customDatas} setCustomDatas={setCustomDatas} />
            <Exportador vendas={vendas} gastos={gastos} filtro={filtro} />
          </div>
        )}

        {activeTab !== 'taxas' && activeTab !== 'relatorios' && activeTab !== 'fornecedores' && activeTab !== 'fechamento' && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
              <div className="text-center md:text-left">
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Visão Geral</p>
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
                  {activeTab === 'dash' ? 'DASHBOARD' : activeTab === 'vendas' ? 'VENDAS' : activeTab === 'gastos_biz' ? 'GASTOS LOJA' : 'GASTOS CASA'}
                </h2>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button onClick={() => setIsModalVendaOpen(true)} className="flex-1 md:flex-none bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-200">+ Venda</button>
                <button onClick={() => setIsModalGastoOpen(true)} className="flex-1 md:flex-none bg-red-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-red-200">- Gasto</button>
              </div>
            </div>

            <FiltroData filtro={filtro} setFiltro={setFiltro} customDatas={customDatas} setCustomDatas={setCustomDatas} />

            {/* CARD DE TOTAL EM DESTAQUE - REINSERIDO E AMPLIADO */}
            {activeTab !== 'dash' && (
              <div className="mb-8 mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className={`p-8 rounded-[2.5rem] shadow-xl border-l-[12px] flex items-center justify-between bg-white ${
                  activeTab === 'vendas' ? 'border-emerald-500' : 
                  activeTab === 'gastos_biz' ? 'border-red-500' : 'border-purple-500'
                }`}>
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                      Total Acumulado ({filtro})
                    </p>
                    <p className={`text-5xl font-black font-mono tracking-tighter ${
                      activeTab === 'vendas' ? 'text-emerald-600' : 
                      activeTab === 'gastos_biz' ? 'text-red-600' : 'text-purple-600'
                    }`}>
                      {activeTab === 'vendas' ? formatarMoeda(totalBruto) : activeTab === 'gastos_biz' ? formatarMoeda(totalLoja) : formatarMoeda(totalPessoal)}
                    </p>
                  </div>
                  <div className="hidden md:block text-6xl opacity-10 font-black">
                    {activeTab === 'vendas' ? '💰' : activeTab === 'gastos_biz' ? '🏢' : '🏠'}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dash' && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 mt-4 md:mt-8">
                  <div className="bg-white p-4 rounded-3xl shadow-sm border-b-8 border-emerald-500 text-center">
                    <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase">Bruto</p>
                    <p className="text-sm md:text-lg font-black text-emerald-600">{formatarMoeda(totalBruto)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-3xl shadow-sm border-b-8 border-cyan-500 text-center">
                    <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase">Líquido</p>
                    <p className="text-sm md:text-lg font-black text-cyan-600">{formatarMoeda(totalLiquido)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-3xl shadow-sm border-b-8 border-red-500 text-center">
                    <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase">Loja</p>
                    <p className="text-sm md:text-lg font-black text-red-600">{formatarMoeda(totalLoja)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-3xl shadow-sm border-b-8 border-purple-500 text-center">
                    <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase">Casa</p>
                    <p className="text-sm md:text-lg font-black text-purple-600">{formatarMoeda(totalPessoal)}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1 bg-white p-4 rounded-3xl shadow-sm border-b-8 border-blue-600 text-center">
                    <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase">Saldo</p>
                    <p className={`text-sm md:text-lg font-black ${lucroReal >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{formatarMoeda(lucroReal)}</p>
                  </div>
                </div>

                <div className="mt-8"><GraficoEvolucao vendas={vendas} taxas={taxas} /></div>
                <GraficoDespesas gastos={gastos} />
              </>
            )}

            {activeTab === 'vendas' && <ExtratoVendas lista={vendas} taxas={taxas} onExcluir={excluirRegistro} />}
            
            {(activeTab === 'gastos_biz' || activeTab === 'gastos_pers') && (
              <div className="space-y-4">
                <ExtratoGastos 
                   lista={gastos.filter(g => g.tipo === (activeTab === 'gastos_pers' ? 'Pessoal' : 'Loja'))} 
                   onExcluir={excluirRegistro} 
                />
              </div>
            )}
          </>
        )}

        <ModalVenda 
          isOpen={isModalVendaOpen} 
          onClose={() => setIsModalVendaOpen(false)} 
          onSalvar={async (d) => {
            const { valor_bruto, ...dadosSemBruto } = d; 
            const { error } = await supabase.from('faturamento_diario').insert([dadosSemBruto]);
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