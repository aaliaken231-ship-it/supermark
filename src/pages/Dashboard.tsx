import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Users as UsersIcon,
  ShoppingCart,
  FileText,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Layout from '../components/Layout';
import { getAll, STORES } from '../services/db';
import { Product, Sale, Client, Shop } from '../types';
import { formatCurrency, cn } from '../utils';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    dailySales: 0,
    totalProducts: 0,
    lowStock: 0,
    activeClients: 0
  });
  const [shop, setShop] = useState<Shop | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      const products = await getAll(STORES.PRODUCTS) as Product[];
      const sales = await getAll(STORES.SALES) as Sale[];
      const clients = await getAll(STORES.CLIENTS) as Client[];
      const shops = await getAll(STORES.SHOP) as Shop[];

      if (shops.length > 0) {
        setShop(shops[0]);
      }

      const today = new Date().toISOString().split('T')[0];
      const todaySales = sales
        .filter(s => s.date_vente.startsWith(today))
        .reduce((acc, s) => acc + s.prix_ttc, 0);

      const lowStockCount = products.filter(p => p.stock_actuel <= p.seuil_alerte).length;

      setStats({
        dailySales: todaySales,
        totalProducts: products.length,
        lowStock: lowStockCount,
        activeClients: clients.length
      });

      // Simple chart data for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const daySales = sales
          .filter(s => s.date_vente.startsWith(dateStr))
          .reduce((acc, s) => acc + s.prix_ttc, 0);
        return { name: dateStr.split('-').slice(1).join('/'), sales: daySales };
      }).reverse();
      setChartData(last7Days);

      setPieData([
        { name: 'Ventes', value: sales.length, color: '#10b981' },
        { name: 'Produits', value: products.length, color: '#0ea5e9' },
        { name: 'Stock Bas', value: lowStockCount, color: '#f43f5e' },
        { name: 'Clients', value: clients.length, color: '#8b5cf6' }
      ]);
    };
    loadStats();
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            {shop?.logo_url ? (
              <img 
                src={shop.logo_url} 
                alt="Logo" 
                className="w-16 h-16 object-contain rounded-2xl bg-slate-50 p-2 border border-slate-100"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                {shop?.nom_boutique?.[0] || "S"}
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900">{shop?.nom_boutique || "Tableau de Bord"}</h1>
              <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Tableau de Bord • {shop?.slogan || "Gestion en temps réel"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/sales" className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2 text-sm">
              <ShoppingCart className="w-5 h-5" />
              NOUVELLE VENTE
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Ventes du jour" 
            value={formatCurrency(stats.dailySales)} 
            icon={TrendingUp} 
            color="emerald" 
            trend="+12.5%"
          />
          <StatCard 
            title="Total Produits" 
            value={stats.totalProducts.toString()} 
            icon={Package} 
            color="blue" 
          />
          <StatCard 
            title="Stock Bas" 
            value={stats.lowStock.toString()} 
            icon={AlertTriangle} 
            color="rose" 
            alert={stats.lowStock > 0}
          />
          <StatCard 
            title="Clients Actifs" 
            value={stats.activeClients.toString()} 
            icon={UsersIcon} 
            color="violet" 
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction to="/sales" label="Vente" icon={ShoppingCart} color="bg-emerald-500" />
          <QuickAction to="/my-invoices" label="Factures" icon={FileText} color="bg-blue-500" />
          <QuickAction to="/my-account" label="Compte" icon={Wallet} color="bg-violet-500" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Ventes des 7 derniers jours</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Répartition</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-slate-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon: Icon, color, trend, alert }: any) {
  const colors: any = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    rose: "bg-rose-50 text-rose-600",
    violet: "bg-violet-50 text-violet-600"
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden"
    >
      {alert && (
        <div className="absolute top-0 right-0 w-16 h-16">
          <div className="absolute top-[-10px] right-[-30px] w-20 h-10 bg-rose-500 rotate-45 flex items-center justify-center">
            <span className="text-[10px] text-white font-bold uppercase tracking-tighter">Alerte</span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-2xl", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
            <ArrowUpRight className="w-4 h-4" />
            {trend}
          </div>
        )}
      </div>
      <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">{title}</p>
      <h4 className="text-2xl font-black text-slate-900 mt-1">{value}</h4>
    </motion.div>
  );
}

function QuickAction({ to, label, icon: Icon, color }: any) {
  return (
    <Link to={to}>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn("p-6 rounded-3xl shadow-lg flex items-center gap-4 text-white", color)}
      >
        <div className="bg-white/20 p-3 rounded-2xl">
          <Icon className="w-8 h-8" />
        </div>
        <span className="text-xl font-bold">{label}</span>
      </motion.div>
    </Link>
  );
}
