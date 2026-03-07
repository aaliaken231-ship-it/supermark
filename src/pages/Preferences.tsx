import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Coins, 
  Calendar, 
  Hash, 
  Clock,
  Save,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getAll, add, put, STORES } from '../services/db';
import { Settings } from '../types';
import { cn } from '../utils';

export default function Preferences() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [formData, setFormData] = useState({
    theme: 'clair' as 'clair' | 'sombre',
    devise: 'FC',
    format_date: 'DD/MM/YYYY',
    prefixe_facture: 'FAC',
    delai_verrouillage: 5
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getAll(STORES.SETTINGS);
    if (data.length > 0) {
      setSettings(data[0]);
      setFormData({
        theme: data[0].theme,
        devise: data[0].devise,
        format_date: data[0].format_date,
        prefixe_facture: data[0].prefixe_facture,
        delai_verrouillage: data[0].delai_verrouillage
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (settings) {
      await put(STORES.SETTINGS, { ...settings, ...formData });
    } else {
      await add(STORES.SETTINGS, {
        ...formData,
        langue: 'Français'
      });
    }
    await loadSettings();
    setLoading(false);
    alert("Préférences enregistrées !");
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Préférences Système</h1>
            <p className="text-slate-500 font-medium">Personnalisez l'apparence et le comportement de votre application</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 space-y-8">
              {/* Theme Selection */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Thème Visuel</p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: 'clair' })}
                    className={cn(
                      "flex items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all",
                      formData.theme === 'clair' ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-100 text-slate-400"
                    )}
                  >
                    <Sun className="w-6 h-6" />
                    <span className="font-bold">Clair</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: 'sombre' })}
                    className={cn(
                      "flex items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all opacity-50 cursor-not-allowed",
                      formData.theme === 'sombre' ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-100 text-slate-400"
                    )}
                  >
                    <Moon className="w-6 h-6" />
                    <span className="font-bold">Sombre (Bientôt)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Coins className="w-4 h-4" />
                    Devise par défaut
                  </div>
                  <input 
                    type="text" 
                    value={formData.devise}
                    onChange={(e) => setFormData({ ...formData, devise: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Calendar className="w-4 h-4" />
                    Format de date
                  </div>
                  <input 
                    type="text" 
                    value={formData.format_date}
                    onChange={(e) => setFormData({ ...formData, format_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Hash className="w-4 h-4" />
                    Préfixe Facture
                  </div>
                  <input 
                    type="text" 
                    value={formData.prefixe_facture}
                    onChange={(e) => setFormData({ ...formData, prefixe_facture: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Clock className="w-4 h-4" />
                    Verrouillage (min)
                  </div>
                  <input 
                    type="number" 
                    value={formData.delai_verrouillage}
                    onChange={(e) => setFormData({ ...formData, delai_verrouillage: parseInt(e.target.value) || 5 })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    Enregistrer les Préférences
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
