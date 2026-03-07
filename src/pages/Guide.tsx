import { 
  HelpCircle, 
  BookOpen, 
  LogIn, 
  ShoppingCart, 
  Package, 
  Key, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { cn } from '../utils';

export default function Guide() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Guide d'Utilisation</h1>
            <p className="text-slate-500 font-medium">Apprenez à maîtriser toutes les fonctionnalités de SuperGère</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-2 sticky top-24 h-fit">
            <GuideNav label="Démarrage" active />
            <GuideNav label="Ventes" />
            <GuideNav label="Stock" />
            <GuideNav label="Licences" />
            <GuideNav label="FAQ" />
          </div>

          <div className="md:col-span-3 space-y-12">
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-emerald-600">
                <BookOpen className="w-8 h-8" />
                <h2 className="text-2xl font-black">1. Démarrage</h2>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <LogIn className="w-5 h-5 text-slate-400" />
                    Connexion
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Pour accéder au système, utilisez vos identifiants fournis par l'administrateur. Choisissez votre rôle (Vendeur, Gérant, etc.) pour accéder aux fonctionnalités correspondantes.
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-slate-400" />
                    Types d'utilisateurs
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3 text-sm">
                      <span className="font-black text-emerald-600">SuperAdmin:</span>
                      <span className="text-slate-600">Accès total et gestion des licences.</span>
                    </li>
                    <li className="flex gap-3 text-sm">
                      <span className="font-black text-blue-600">Administrateur:</span>
                      <span className="text-slate-600">Gestion complète de la boutique.</span>
                    </li>
                    <li className="flex gap-3 text-sm">
                      <span className="font-black text-orange-600">Gérant:</span>
                      <span className="text-slate-600">Gestion des stocks et produits.</span>
                    </li>
                    <li className="flex gap-3 text-sm">
                      <span className="font-black text-slate-600">Vendeur:</span>
                      <span className="text-slate-600">Opérations de vente uniquement.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 text-emerald-600">
                <ShoppingCart className="w-8 h-8" />
                <h2 className="text-2xl font-black">2. Gestion des Ventes</h2>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                <p className="text-slate-600 leading-relaxed">
                  Le module de vente est conçu pour être rapide et intuitif :
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="font-bold text-sm mb-1">Panier</p>
                    <p className="text-xs text-slate-500">Ajoutez des produits en cliquant sur les cartes. Ajustez les quantités directement dans le panier.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="font-bold text-sm mb-1">Validation</p>
                    <p className="text-xs text-slate-500">Une fois le panier prêt, renseignez le client et validez. Le stock sera déduit automatiquement.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 text-emerald-600">
                <Package className="w-8 h-8" />
                <h2 className="text-2xl font-black">3. Gestion de Stock</h2>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                <p className="text-slate-600 leading-relaxed">
                  Surveillez vos niveaux de stock grâce aux alertes automatiques. Un produit passe en rouge dès qu'il atteint son seuil d'alerte.
                </p>
                <div className="flex items-center gap-4 bg-rose-50 p-4 rounded-2xl border border-rose-100">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                  <p className="text-sm text-rose-700 font-medium">
                    N'oubliez pas d'enregistrer vos approvisionnements pour augmenter le stock disponible.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 text-emerald-600">
                <Key className="w-8 h-8" />
                <h2 className="text-2xl font-black">4. Licences</h2>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                <div className="space-y-4">
                  <p className="text-slate-600 leading-relaxed">Le système de licence comporte 3 étapes :</p>
                  <ol className="list-decimal list-inside space-y-3 text-sm font-medium text-slate-700">
                    <li>Générez une demande de licence (.lic)</li>
                    <li>Envoyez ce fichier à christophefolinga@gmail.com</li>
                    <li>Importez le fichier de licence reçu pour activer l'application</li>
                  </ol>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function GuideNav({ label, active }: any) {
  return (
    <button className={cn(
      "w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all",
      active ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-100"
    )}>
      {label}
      <ChevronRight className="w-4 h-4" />
    </button>
  );
}

function UserCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
  );
}

function AlertTriangle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
