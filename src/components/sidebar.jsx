const Sidebar = ({ activeTab, setActiveTab }) => {
  const menu = [
    { id: 'dash', label: 'Dashboard', icon: '📊' },
    { id: 'vendas', label: 'Vendas', icon: '💰' },
    { id: 'gastos_biz', label: 'Gastos Loja', icon: '🏢' },
    { id: 'gastos_pers', label: 'Gastos Casa', icon: '🏠' },
    { id: 'fornecedores', label: 'Fornecedores', icon: '🤝' },
    { id: 'taxas', label: 'Taxas', icon: '⚙️' },
    { id: 'relatorios', label: 'Relatórios', icon: '📋' }
  ];

  return (
    <aside className="w-64 bg-gray-900 h-screen fixed left-0 top-0 text-white p-6 shadow-xl z-20">
      <h1 className="text-xl font-black mb-10 text-emerald-400 tracking-tighter">FINANCE PRO</h1>
      <nav className="space-y-2">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              activeTab === item.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;