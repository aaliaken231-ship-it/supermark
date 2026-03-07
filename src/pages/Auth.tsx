import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, Eye, EyeOff, ArrowLeft, ShieldAlert } from 'lucide-react';
import { login } from '../services/auth';
import { getAll, STORES } from '../services/db';
import { UserType, Shop } from '../types';
import { cn } from '../utils';

export default function Auth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('Vendeur');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const loadShop = async () => {
      const shops = await getAll(STORES.SHOP);
      if (shops.length > 0) {
        setShop(shops[0]);
      }
    };
    loadShop();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      if (user) {
        if (user.user_type !== userType) {
          setError('Type d\'utilisateur incorrect pour ce compte.');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Identifiants invalides ou compte désactivé.');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 bg-emerald-600 text-white text-center flex flex-col items-center">
          {shop?.logo_url ? (
            <img 
              src={shop.logo_url} 
              alt="Logo" 
              className="w-24 h-24 object-contain mb-4 rounded-2xl bg-white p-3 shadow-lg"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="bg-white/20 p-3 rounded-2xl mb-4">
              <LogIn className="w-10 h-10 text-white" />
            </div>
          )}
          <h2 className="text-3xl font-bold">{shop?.nom_boutique || "SuperGère"}</h2>
          <p className="text-emerald-100 mt-2">Connectez-vous à votre espace de gestion</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm"
            >
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Nom d'utilisateur</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="Ex: Admin"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Type d'utilisateur</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value as UserType)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
            >
              <option value="Vendeur">Vendeur</option>
              <option value="Gérant">Gérant</option>
              <option value="Administrateur">Administrateur</option>
              <option value="SuperAdmin">SuperAdmin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2",
              loading && "opacity-70 cursor-not-allowed"
            )}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-6 h-6" />
                Se connecter
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full text-slate-500 font-medium flex items-center justify-center gap-2 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </button>
        </form>
      </motion.div>
    </div>
  );
}
