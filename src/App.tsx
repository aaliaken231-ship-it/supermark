import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useLocation 
} from 'react-router-dom';
import { seedInitialUsers, getCurrentUser } from './services/auth';
import { getAll, STORES, db } from './services/db';
import { Shop } from './types';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import MyAccount from './pages/MyAccount';
import MyInvoices from './pages/MyInvoices';
import ShopInfo from './pages/ShopInfo';
import Users from './pages/Users';
import Products from './pages/Products';
import Supplies from './pages/Supplies';
import Stock from './pages/Stock';
import Clients from './pages/Clients';
import Deposits from './pages/Deposits';
import Withdrawals from './pages/Withdrawals';
import GeneralAccounts from './pages/GeneralAccounts';
import GeneralInvoices from './pages/GeneralInvoices';
import Licenses from './pages/Licenses';
import History from './pages/History';
import Preferences from './pages/Preferences';
import Languages from './pages/Languages';
import Guide from './pages/Guide';
import { Toaster, toast } from 'sonner';

function PrivateRoute({ children, roles }: { children: React.ReactNode, roles?: string[] }) {
  const user = getCurrentUser();
  const location = useLocation();
  const [licenseStatus, setLicenseStatus] = useState<{ active: boolean, loading: boolean }>({ active: true, loading: true });

  useEffect(() => {
    const checkLicense = async () => {
      const active = await db.getActiveLicense();
      // Grace period check is handled by getActiveLicense if we update it, 
      // or we can do it here. Let's update getActiveLicense in db.ts to be more robust.
      setLicenseStatus({ active: !!active, loading: false });
    };
    checkLicense();
  }, []);

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (licenseStatus.loading) {
    return null; // Or a loading spinner
  }

  // Allow SuperAdmin to access Licenses page even if expired
  const isLicensePage = location.pathname === '/licenses';
  if (!licenseStatus.active && !isLicensePage && user.user_type !== 'SuperAdmin') {
    return <Navigate to="/licenses" replace />;
  }

  if (roles && !roles.includes(user.user_type)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);

  useEffect(() => {
    const init = async () => {
      await seedInitialUsers();
      const shops = await getAll(STORES.SHOP);
      if (shops.length > 0) {
        setShop(shops[0]);
      }
      
      // License expiration check
      const activeLicense = await db.getActiveLicense();
      if (activeLicense && activeLicense.expires_at) {
        const diff = new Date(activeLicense.expires_at).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days > 0 && days <= 7) {
          toast.warning("Attention: Expiration de licence", {
            description: `Votre licence expire dans ${days} jour(s). Pensez à la renouveler.`,
            duration: 10000
          });
        }
      }
      
      setIsInitialized(true);
    };
    init();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-emerald-50 p-6">
        {shop?.logo_url ? (
          <img 
            src={shop.logo_url} 
            alt="Logo" 
            className="w-32 h-32 object-contain mb-8 animate-pulse rounded-2xl shadow-xl bg-white p-4"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-24 h-24 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl mb-8 animate-bounce shadow-xl">
            S
          </div>
        )}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="mt-4 text-emerald-800 font-bold tracking-widest uppercase text-xs">Chargement de {shop?.nom_boutique || "SuperGère"}...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/sales" element={<PrivateRoute><Sales /></PrivateRoute>} />
        <Route path="/my-account" element={<PrivateRoute><MyAccount /></PrivateRoute>} />
        <Route path="/my-invoices" element={<PrivateRoute><MyInvoices /></PrivateRoute>} />
        
        <Route path="/shop-info" element={<PrivateRoute roles={['SuperAdmin', 'Administrateur']}><ShopInfo /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute roles={['SuperAdmin', 'Administrateur']}><Users /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute roles={['SuperAdmin', 'Administrateur', 'Gérant']}><Products /></PrivateRoute>} />
        <Route path="/supplies" element={<PrivateRoute roles={['SuperAdmin', 'Administrateur', 'Gérant']}><Supplies /></PrivateRoute>} />
        <Route path="/stock" element={<PrivateRoute roles={['SuperAdmin', 'Administrateur', 'Gérant']}><Stock /></PrivateRoute>} />
        <Route path="/clients" element={<PrivateRoute roles={['SuperAdmin', 'Administrateur', 'Gérant']}><Clients /></PrivateRoute>} />
        
        <Route path="/deposits" element={<PrivateRoute roles={['SuperAdmin', 'Administrateur']}><Deposits /></PrivateRoute>} />
        <Route path="/withdrawals" element={<PrivateRoute roles={['SuperAdmin', 'Administrateur']}><Withdrawals /></PrivateRoute>} />
        <Route path="/general-accounts" element={<PrivateRoute roles={['SuperAdmin', 'Administrateur']}><GeneralAccounts /></PrivateRoute>} />
        <Route path="/general-invoices" element={<PrivateRoute roles={['SuperAdmin', 'Administrateur']}><GeneralInvoices /></PrivateRoute>} />
        <Route path="/licenses" element={<PrivateRoute roles={['SuperAdmin', 'Administrateur']}><Licenses /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute roles={['SuperAdmin', 'Administrateur']}><History /></PrivateRoute>} />
        
        <Route path="/preferences" element={<PrivateRoute roles={['SuperAdmin', 'Administrateur']}><Preferences /></PrivateRoute>} />
        <Route path="/languages" element={<PrivateRoute roles={['SuperAdmin', 'Administrateur']}><Languages /></PrivateRoute>} />
        <Route path="/guide" element={<PrivateRoute><Guide /></PrivateRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </Router>
  );
}
