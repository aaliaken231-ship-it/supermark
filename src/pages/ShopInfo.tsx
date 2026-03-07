import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Upload, 
  Save, 
  CheckCircle2,
  Image as ImageIcon,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getAll, add, put, STORES } from '../services/db';
import { Shop } from '../types';
import { generateId } from '../utils';

export default function ShopInfo() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [formData, setFormData] = useState({
    nom_boutique: 'Au Super Marché',
    proprietaire: '',
    lieu: '',
    email: '',
    telephone: '',
    slogan: 'Qualité, Service et Fraîcheur au quotidien !',
    logo_url: '',
    cachet_url: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadShop();
  }, []);

  const loadShop = async () => {
    const data = await getAll(STORES.SHOP);
    if (data.length > 0) {
      setShop(data[0]);
      setFormData({
        nom_boutique: data[0].nom_boutique,
        proprietaire: data[0].proprietaire,
        lieu: data[0].lieu,
        email: data[0].email,
        telephone: data[0].telephone,
        slogan: data[0].slogan,
        logo_url: data[0].logo_url || '',
        cachet_url: data[0].cachet_url || ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (shop) {
      await put(STORES.SHOP, { ...shop, ...formData });
    } else {
      await add(STORES.SHOP, {
        ...formData,
        code_boutique: generateId('SHP')
      });
    }
    await loadShop();
    setLoading(false);
    alert("Informations de la boutique mises à jour !");
  };

  const handleFileUpload = (type: 'logo' | 'cachet', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setFormData(prev => ({
        ...prev,
        [type === 'logo' ? 'logo_url' : 'cachet_url']: url
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Info Boutique</h1>
            <p className="text-slate-500 font-medium">Configurez l'identité visuelle et les coordonnées de votre établissement</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo & Cachet */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logo Boutique</p>
                <div className="w-32 h-32 mx-auto bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                  {formData.logo_url ? (
                    <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-slate-300" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload('logo', e)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Cliquez pour changer le logo</p>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cachet Officiel</p>
                <div className="w-32 h-32 mx-auto bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                  {formData.cachet_url ? (
                    <img src={formData.cachet_url} alt="Cachet" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-slate-300" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload('cachet', e)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Cliquez pour changer le cachet</p>
              </div>
            </div>

            {/* General Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nom de la boutique</label>
                    <input 
                      type="text" 
                      required
                      value={formData.nom_boutique}
                      onChange={(e) => setFormData({ ...formData, nom_boutique: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Propriétaire</label>
                    <input 
                      type="text" 
                      required
                      value={formData.proprietaire}
                      onChange={(e) => setFormData({ ...formData, proprietaire: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Slogan / Message</label>
                  <input 
                    type="text" 
                    value={formData.slogan}
                    onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none italic text-slate-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Lieu / Adresse</label>
                    <input 
                      type="text" 
                      value={formData.lieu}
                      onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Téléphone</label>
                    <input 
                      type="text" 
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email de contact</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

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
                      Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
