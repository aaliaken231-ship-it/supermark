import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users as UsersIcon, 
  History, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Store, 
  Truck, 
  Database, 
  Wallet, 
  FileText, 
  Key, 
  UserCircle,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Globe,
  Shield,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { getCurrentUser, logout } from '../services/auth';
import { cn } from '../utils';
import { db, getAll, STORES } from '../services/db';
import { Shop, License } from '../types';

interface SidebarItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function SidebarItem({ to, icon: Icon, label, active, onClick }: SidebarItemProps) {
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group",
        active 
          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
          : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
      )}
    >
      <Icon className={cn("w-4.5 h-4.5", active ? "text-white" : "text-slate-400 group-hover:text-emerald-600")} />
      <span className="font-medium text-sm">{label}</span>
      {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
    </Link>
  );
}

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, isOpen, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="space-y-1">
      <button 
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-2 text-[10px] uppercase tracking-widest text-slate-400 font-bold hover:text-slate-600 transition-colors group"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 transition-transform" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 transition-transform" />
        )}
      </button>
      <div className={cn(
        "space-y-1 overflow-hidden transition-all duration-300",
        isOpen ? "max-h-[1000px] opacity-100 mt-2" : "max-h-0 opacity-0"
      )}>
        {children}
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    admin: true,
    sales: true,
    settings: true
  });
  const [shop, setShop] = useState<Shop | null>(null);
  const [activeLicense, setActiveLicense] = useState<License | null>(null);
  const user = getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadData = async () => {
      const [shops, license] = await Promise.all([
        getAll(STORES.SHOP),
        db.getActiveLicense()
      ]);
      if (shops.length > 0) {
        setShop(shops[0]);
      }
      setActiveLicense(license || null);
    };
    loadData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const isAdmin = ['SuperAdmin', 'Administrateur'].includes(user?.user_type);
  const isManager = ['SuperAdmin', 'Administrateur', 'Gérant'].includes(user?.user_type);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 p-6 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 mb-10 px-2">
          {shop?.logo_url ? (
            <img 
              src={shop.logo_url} 
              alt="Logo" 
              className="w-10 h-10 object-contain rounded-lg bg-slate-50 p-1 border border-slate-100"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h1 className="font-bold text-slate-900 leading-tight truncate w-40">
              {shop?.nom_boutique || "SuperGère"}
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Système de Gestion</p>
          </div>
        </div>

        <nav className="flex-1 space-y-6">
          {isManager && (
            <CollapsibleSection 
              title="Administration" 
              isOpen={openSections.admin} 
              onToggle={() => toggleSection('admin')}
            >
              {isAdmin && <SidebarItem to="/shop-info" icon={Store} label="Info Boutique" active={location.pathname === '/shop-info'} />}
              {isAdmin && <SidebarItem to="/users" icon={UserCircle} label="Utilisateurs" active={location.pathname === '/users'} />}
              <SidebarItem to="/products" icon={Package} label="Produits" active={location.pathname === '/products'} />
              <SidebarItem to="/supplies" icon={Truck} label="Approvisionnements" active={location.pathname === '/supplies'} />
              <SidebarItem to="/stock" icon={Database} label="Gestion de Stock" active={location.pathname === '/stock'} />
              {isAdmin && <SidebarItem to="/general-accounts" icon={FileText} label="Compte Général" active={location.pathname === '/general-accounts'} />}
              {isAdmin && <SidebarItem to="/general-invoices" icon={FileText} label="Facture Générale" active={location.pathname === '/general-invoices'} />}
              {isAdmin && <SidebarItem to="/licenses" icon={Key} label="Licence" active={location.pathname === '/licenses'} />}
              <SidebarItem to="/clients" icon={UsersIcon} label="Clients" active={location.pathname === '/clients'} />
              {isAdmin && <SidebarItem to="/deposits" icon={Wallet} label="Dépôts" active={location.pathname === '/deposits'} />}
              {isAdmin && <SidebarItem to="/withdrawals" icon={Wallet} label="Retraits" active={location.pathname === '/withdrawals'} />}
              {isAdmin && <SidebarItem to="/history" icon={History} label="Historique" active={location.pathname === '/history'} />}
            </CollapsibleSection>
          )}

          <CollapsibleSection 
            title="Ventes" 
            isOpen={openSections.sales} 
            onToggle={() => toggleSection('sales')}
          >
            <SidebarItem to="/sales" icon={ShoppingCart} label="Nouvelle Vente" active={location.pathname === '/sales'} />
            <SidebarItem to="/my-account" icon={UserCircle} label="Mon Compte" active={location.pathname === '/my-account'} />
            <SidebarItem to="/my-invoices" icon={FileText} label="Mes Factures" active={location.pathname === '/my-invoices'} />
          </CollapsibleSection>

          <CollapsibleSection 
            title="Paramètres" 
            isOpen={openSections.settings} 
            onToggle={() => toggleSection('settings')}
          >
            {isAdmin && <SidebarItem to="/preferences" icon={Settings} label="Préférences" active={location.pathname === '/preferences'} />}
            {isAdmin && <SidebarItem to="/languages" icon={Globe} label="Langues" active={location.pathname === '/languages'} />}
            <SidebarItem to="/guide" icon={HelpCircle} label="Guide" active={location.pathname === '/guide'} />
          </CollapsibleSection>
        </nav>

        <div className="mt-10 pt-6 border-t border-slate-100">
          {/* License Status Badge */}
          <div className="px-4 mb-6">
            <Link to="/licenses" className={cn(
              "flex items-center gap-3 p-3 rounded-xl border transition-all",
              activeLicense 
                ? "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100" 
                : "bg-red-50 border-red-100 text-red-700 hover:bg-red-100"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                activeLicense ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
              )}>
                {activeLicense ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Licence</p>
                <p className="text-xs font-bold truncate">
                  {activeLicense ? activeLicense.type_licence : "Invalide / Expirée"}
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              {user?.nom_utilisateur?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.nom_utilisateur}</p>
              <p className="text-xs text-slate-500 font-medium">{user?.user_type}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden transform transition-transform duration-300 p-6 overflow-y-auto shadow-2xl",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            {shop?.logo_url ? (
              <img 
                src={shop.logo_url} 
                alt="Logo" 
                className="w-10 h-10 object-contain rounded-lg bg-slate-50 p-1 border border-slate-100"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="bg-emerald-600 p-2 rounded-lg">
                <Store className="w-6 h-6 text-white" />
              </div>
            )}
            <h1 className="font-bold text-slate-900 truncate w-32">{shop?.nom_boutique || "SuperGère"}</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="space-y-6">
          {isManager && (
            <CollapsibleSection 
              title="Administration" 
              isOpen={openSections.admin} 
              onToggle={() => toggleSection('admin')}
            >
              {isAdmin && <SidebarItem to="/shop-info" icon={Store} label="Info Boutique" active={location.pathname === '/shop-info'} onClick={() => setIsSidebarOpen(false)} />}
              {isAdmin && <SidebarItem to="/users" icon={UserCircle} label="Utilisateurs" active={location.pathname === '/users'} onClick={() => setIsSidebarOpen(false)} />}
              <SidebarItem to="/products" icon={Package} label="Produits" active={location.pathname === '/products'} onClick={() => setIsSidebarOpen(false)} />
              <SidebarItem to="/supplies" icon={Truck} label="Approvisionnements" active={location.pathname === '/supplies'} onClick={() => setIsSidebarOpen(false)} />
              <SidebarItem to="/stock" icon={Database} label="Gestion de Stock" active={location.pathname === '/stock'} onClick={() => setIsSidebarOpen(false)} />
              {isAdmin && <SidebarItem to="/general-accounts" icon={FileText} label="Compte Général" active={location.pathname === '/general-accounts'} onClick={() => setIsSidebarOpen(false)} />}
              {isAdmin && <SidebarItem to="/general-invoices" icon={FileText} label="Facture Générale" active={location.pathname === '/general-invoices'} onClick={() => setIsSidebarOpen(false)} />}
              {isAdmin && <SidebarItem to="/licenses" icon={Key} label="Licence" active={location.pathname === '/licenses'} onClick={() => setIsSidebarOpen(false)} />}
              <SidebarItem to="/clients" icon={UsersIcon} label="Clients" active={location.pathname === '/clients'} onClick={() => setIsSidebarOpen(false)} />
              {isAdmin && <SidebarItem to="/deposits" icon={Wallet} label="Dépôts" active={location.pathname === '/deposits'} onClick={() => setIsSidebarOpen(false)} />}
              {isAdmin && <SidebarItem to="/withdrawals" icon={Wallet} label="Retraits" active={location.pathname === '/withdrawals'} onClick={() => setIsSidebarOpen(false)} />}
              {isAdmin && <SidebarItem to="/history" icon={History} label="Historique" active={location.pathname === '/history'} onClick={() => setIsSidebarOpen(false)} />}
            </CollapsibleSection>
          )}

          <CollapsibleSection 
            title="Ventes" 
            isOpen={openSections.sales} 
            onToggle={() => toggleSection('sales')}
          >
            <SidebarItem to="/sales" icon={ShoppingCart} label="Nouvelle Vente" active={location.pathname === '/sales'} onClick={() => setIsSidebarOpen(false)} />
            <SidebarItem to="/my-account" icon={UserCircle} label="Mon Compte" active={location.pathname === '/my-account'} onClick={() => setIsSidebarOpen(false)} />
            <SidebarItem to="/my-invoices" icon={FileText} label="Mes Factures" active={location.pathname === '/my-invoices'} onClick={() => setIsSidebarOpen(false)} />
          </CollapsibleSection>

          <CollapsibleSection 
            title="Paramètres" 
            isOpen={openSections.settings} 
            onToggle={() => toggleSection('settings')}
          >
            {isAdmin && <SidebarItem to="/preferences" icon={Settings} label="Préférences" active={location.pathname === '/preferences'} onClick={() => setIsSidebarOpen(false)} />}
            {isAdmin && <SidebarItem to="/languages" icon={Globe} label="Langues" active={location.pathname === '/languages'} onClick={() => setIsSidebarOpen(false)} />}
            <SidebarItem to="/guide" icon={HelpCircle} label="Guide" active={location.pathname === '/guide'} onClick={() => setIsSidebarOpen(false)} />
          </CollapsibleSection>
        </nav>

        <div className="mt-10 pt-6 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="lg:hidden flex items-center gap-2">
            {shop?.logo_url ? (
              <img 
                src={shop.logo_url} 
                alt="Logo" 
                className="w-8 h-8 object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Store className="w-5 h-5 text-emerald-600" />
            )}
            <span className="font-black text-slate-900 text-xs truncate max-w-[120px] uppercase tracking-tight">{shop?.nom_boutique}</span>
          </div>

          <div className="flex-1 lg:flex-none flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 border-l border-slate-200 pl-6 ml-2">
              {shop?.logo_url ? (
                <img 
                  src={shop.logo_url} 
                  alt="Shop Logo" 
                  className="w-8 h-8 object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Store className="w-5 h-5 text-emerald-600" />
              )}
              <span className="font-black text-slate-900 text-sm uppercase tracking-tight">{shop?.nom_boutique || "SuperGère"}</span>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                En ligne
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{user?.nom_utilisateur}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user?.user_type}</p>
            </div>
            {shop?.logo_url ? (
              <img 
                src={shop.logo_url} 
                alt="User Logo" 
                className="w-10 h-10 object-contain rounded-full bg-slate-50 p-1 border-2 border-white shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm">
                {user?.nom_utilisateur?.[0]}
              </div>
            )}
          </div>
        </header>

        <div className="p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
