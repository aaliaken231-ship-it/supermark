import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAll, STORES } from '../services/db';
import { Shop } from '../types';

export default function Index() {
  const [shop, setShop] = useState<Shop | null>(null);

  useEffect(() => {
    const loadShop = async () => {
      const shops = await getAll(STORES.SHOP);
      if (shops.length > 0) {
        setShop(shops[0]);
      }
    };
    loadShop();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <motion.div 
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="inline-block mb-6 bg-white p-6 rounded-full shadow-2xl"
        >
          {shop?.logo_url ? (
            <img src={shop.logo_url} alt="Logo" className="w-24 h-24 object-contain" referrerPolicy="no-referrer" />
          ) : (
            <ShoppingCart className="w-24 h-24 text-emerald-600" />
          )}
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
          {shop?.nom_boutique || "Au Super Marché"}
        </h1>

        <div className="overflow-hidden w-full max-w-md mx-auto mb-12 relative h-8 flex items-center">
          <motion.p 
            animate={{ x: ['100%', '-100%'] }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            className="text-emerald-100 text-xl font-medium whitespace-nowrap absolute left-0"
          >
            {shop?.slogan || "Qualité, Service et Fraîcheur au quotidien !"}
          </motion.p>
        </div>

        <Link to="/auth">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-emerald-700 px-10 py-4 rounded-full font-bold text-xl shadow-xl flex items-center gap-2 mx-auto transition-colors hover:bg-emerald-50"
          >
            Se connecter
            <ArrowRight className="w-6 h-6" />
          </motion.button>
        </Link>
      </motion.div>

      <div className="absolute bottom-8 text-emerald-200/50 text-sm font-mono">
        SuperGère v1.0 • 2026
      </div>
    </div>
  );
}
