import { Globe, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { cn } from '../utils';

export default function Languages() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Langues</h1>
            <p className="text-slate-500 font-medium">Choisissez la langue d'affichage de l'interface</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="flex items-center justify-between p-6 rounded-2xl border-2 border-emerald-500 bg-emerald-50 text-emerald-700 transition-all">
              <div className="flex items-center gap-4">
                <div className="text-2xl">🇫🇷</div>
                <div className="text-left">
                  <p className="font-bold">Français</p>
                  <p className="text-xs opacity-70">Langue par défaut</p>
                </div>
              </div>
              <CheckCircle2 className="w-6 h-6" />
            </button>

            <button disabled className="flex items-center justify-between p-6 rounded-2xl border-2 border-slate-100 text-slate-400 opacity-50 cursor-not-allowed transition-all">
              <div className="flex items-center gap-4">
                <div className="text-2xl">🇬🇧</div>
                <div className="text-left">
                  <p className="font-bold">English</p>
                  <p className="text-xs">Bientôt disponible</p>
                </div>
              </div>
            </button>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
            <Globe className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <p className="text-blue-900 font-bold mb-1">Note sur la localisation</p>
              <p className="text-sm text-blue-700 leading-relaxed">
                L'interface est actuellement optimisée pour le français. Le support d'autres langues sera ajouté dans les prochaines mises à jour pour faciliter l'utilisation internationale.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
